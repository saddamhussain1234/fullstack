import os
from unittest.mock import MagicMock, patch
import pytest
from app.services.ai_service import AIService

def test_ai_service_template_fallback():
    # If no client is configured, it should use the template bio
    service = AIService()
    with patch.object(service, 'client', None):
        bio = service.generate_employee_bio(
            name="Alice Smith",
            designation="Developer",
            department="IT",
            experience="Python, SQL"
        )
        assert "Alice Smith" in bio
        assert "Developer" in bio
        assert "IT" in bio
        assert "Python, SQL" in bio

def test_ai_service_groq_api_call():
    # Mocking the Groq client and its completions
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.choices = [
        MagicMock(message=MagicMock(content="Alice is a Developer in the IT department."))
    ]
    mock_client.chat.completions.create.return_value = mock_response

    service = AIService()
    with patch.object(service, 'client', mock_client):
        bio = service.generate_employee_bio(
            name="Alice Smith",
            designation="Developer",
            department="IT",
            experience="Python, SQL"
        )
        
        # Verify the custom bio was returned from the mocked API
        assert bio == "Alice is a Developer in the IT department."
        
        # Verify the create method was called with expected arguments
        mock_client.chat.completions.create.assert_called_once()
        call_kwargs = mock_client.chat.completions.create.call_args[1]
        assert call_kwargs["model"] == "llama3-8b-8192"
        assert len(call_kwargs["messages"]) == 2
        assert call_kwargs["messages"][0]["role"] == "system"
        assert "Alice Smith" in call_kwargs["messages"][1]["content"]

def test_ai_service_groq_error_fallback():
    # Mocking the Groq client to raise an exception, checking if fallback works
    mock_client = MagicMock()
    mock_client.chat.completions.create.side_effect = Exception("API Error")

    service = AIService()
    with patch.object(service, 'client', mock_client):
        bio = service.generate_employee_bio(
            name="Alice Smith",
            designation="Developer",
            department="IT",
            experience="Python, SQL"
        )
        
        # Verify it fallback to template bio
        assert "Alice Smith" in bio
        assert "Developer" in bio
        assert "IT" in bio
        assert "Python, SQL" in bio
