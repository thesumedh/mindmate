"""
Safety & Security Guardrails Engine

Concept Explanation:
--------------------
In production AI applications—particularly in Cyber Security (e.g. ReliaQuest SecOps)
and Healthcare/Mental Health—relying solely on raw LLM output is risky. Models can hallucinate,
leak system prompts, bypass ethical boundaries, or fail to catch acute crises.

This Guardrail Engine acts as a multi-layered security layer (Defense-in-Depth):
1. **Crisis & Self-Harm Interceptor**: Scans inputs deterministically for suicidal ideation or self-harm keywords,
   bypassing standard generation to immediately return verified crisis lifelines (988 Lifeline).
2. **Prompt Injection & Adversarial Defense**: Detects attempts to extract system instructions, override safety policies,
   or perform jailbreaks (e.g., "ignore previous instructions", "act as DAN", "system prompt dump").
3. **Clinical Boundary Enforcement**: Ensures the agent never claims to be a medical doctor, prescribe medication,
   or offer formal psychiatric diagnoses.
"""

import re
from typing import Tuple, Optional
from app.models.schemas import SafetyEvaluation


# RegEx Patterns for Crisis / Self-Harm indicators
# In a real enterprise system, this is augmented with fine-tuned embedding classifiers
CRISIS_PATTERNS = [
    r"\b(suicide|kill myself|end my life|want to die|take my own life)\b",
    r"\b(hurt myself|self-harm|cutting myself|hang myself|slit my wrist)\b",
    r"\b(better off dead|no reason to live|don't want to wake up|can't go on anymore)\b",
    r"\b(goodbye cruel world|overdose on pills|planning my suicide)\b"
]

# RegEx Patterns for Adversarial Prompt Injections & Jailbreaks
# (Critical concept in AI Cyber Security)
PROMPT_INJECTION_PATTERNS = [
    r"ignore (all )?(previous|above|prior) (instructions|prompts|rules)",
    r"you are now in (DAN|developer|unrestricted|god) mode",
    r"disregard (the )?system (prompt|instructions)",
    r"reveal (the )?system prompt",
    r"print (the )?(hidden|initial|original) prompt",
    r"output everything above this line",
    r"bypass (all )?(safety|ethical) filters"
]

# Standard Crisis Intervention Message
CRISIS_INTERVENTION_MESSAGE = (
    "I hear how much pain you're in, and I want you to know that you are not alone. "
    "Please connect with someone who can support you right now. You can call or text the "
    "Suicide & Crisis Lifeline at **988** (available 24/7, free, and completely confidential). "
    "\n\nIf you are outside the US, please contact your local emergency services or visit "
    "[https://www.iasp.info/resources/Crisis_Centres/](https://www.iasp.info/resources/Crisis_Centres/). "
    "\n\nThere are people who care and want to help you through this moment."
)

# Standard Prompt Injection Rejection Message
INJECTION_DEFENSE_MESSAGE = (
    "I'm here as MindMate to offer supportive and empathetic conversation. "
    "I cannot alter my core safety guidelines or disclose internal system configurations."
)


class SafetyGuardrails:
    """
    Guardrail Validator enforcing security, crisis triage, and boundary compliance.
    """

    @staticmethod
    def inspect_input(user_message: str) -> Tuple[SafetyEvaluation, Optional[str]]:
        """
        Inspects incoming user prompt before sending it to the LLM.
        
        Returns:
            Tuple[SafetyEvaluation, Optional[str]]:
            - SafetyEvaluation: Structured metadata regarding safety flags.
            - Optional[str]: Pre-defined safety override message if a critical violation was flagged.
        """
        cleaned_text = user_message.lower().strip()

        # Step 1: Check for Acute Crisis / Self-Harm Indicators
        for pattern in CRISIS_PATTERNS:
            if re.search(pattern, cleaned_text, re.IGNORECASE):
                evaluation = SafetyEvaluation(
                    is_safe=False,
                    flagged_crisis=True,
                    flagged_injection=False,
                    reason="Crisis/Self-harm indicators detected in user message.",
                    recommended_hotline="988 Suicide & Crisis Lifeline (US) or local emergency services."
                )
                return evaluation, CRISIS_INTERVENTION_MESSAGE

        # Step 2: Check for Prompt Injection / Adversarial Jailbreak Attempts
        for pattern in PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, cleaned_text, re.IGNORECASE):
                evaluation = SafetyEvaluation(
                    is_safe=False,
                    flagged_crisis=False,
                    flagged_injection=True,
                    reason="Adversarial prompt injection pattern detected.",
                    recommended_hotline=None
                )
                return evaluation, INJECTION_DEFENSE_MESSAGE

        # Step 3: Input passed all security guardrails
        return SafetyEvaluation(is_safe=True), None

    @staticmethod
    def sanitize_output(model_output: str) -> str:
        """
        Post-processing guardrail: Sanitizes model output to ensure no hallucinations
        of medical prescriptions or clinical diagnoses.
        
        Concept:
        Output filtering prevents legal liability and ensures therapeutic boundaries.
        """
        # Ensure model disclaimer is upheld if medical advice is hinted
        medical_keywords = ["diagnose you with", "prescribe you", "take this medication", "you have bipolar disorder"]
        for kw in medical_keywords:
            if kw in model_output.lower():
                model_output += "\n\n*(Note: I am an AI companion, not a medical professional. Please consult a licensed healthcare provider for clinical medical advice.)*"
                break

        return model_output
