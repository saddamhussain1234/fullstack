import os
from openai import OpenAI

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class AIService:
    def __init__(self):
        self.api_key = OPENAI_API_KEY
        if self.api_key:
            # Supports custom base url or OpenAI-compatible configurations as well
            base_url = os.getenv("OPENAI_API_BASE", None)
            self.client = OpenAI(api_key=self.api_key, base_url=base_url)
        else:
            self.client = None

    def generate_employee_bio(self, name: str, designation: str, department: str, experience: str) -> str:
        if not self.client:
            return self._generate_template_bio(name, designation, department, experience)
        
        try:
            prompt = (
                f"Write a short, engaging professional employee biography for an organization's directory.\n"
                f"Name: {name}\n"
                f"Designation: {designation}\n"
                f"Department: {department}\n"
                f"Experience/Skills: {experience}\n\n"
                f"Format it in the third person. Keep it strictly between 2 to 3 sentences. Do not use markdown or quotes."
            )
            
            response = self.client.chat.completions.create(
                model=os.getenv("OPENAI_MODEL_NAME", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": "You are an expert HR writer specializing in corporate team profiles and biographies."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            # Gracefully handle API failures or timeout issues by falling back
            print(f"OpenAI bio generation failed: {e}. Falling back to template-based bio.")
            return self._generate_template_bio(name, designation, department, experience)

    def _generate_template_bio(self, name: str, designation: str, department: str, experience: str) -> str:
        # Structured templating fallback based on details
        clean_exp = experience.strip().rstrip('.')
        return (
            f"{name} is a {designation} in the {department} Department with key expertise in {clean_exp}. "
            f"They are passionate about delivering high-quality business outcomes, collaborating with cross-functional "
            f"teams, and driving innovation within their department."
        )

# Singleton service instance
ai_service = AIService()
