"""
Sentiment & Emotional State Analyzer

Concept Explanation:
--------------------
Understanding the user's emotional trajectory across turns allows an AI agent
to adapt its tone (e.g. slowing down pace for panic, offering uplifting validation for sadness).

This module combines rule-based heuristic scoring with emotional lexicon mapping:
1. Fast, zero-latency local computation (essential for low-latency microservices).
2. Quantifies sentiment score from -1.0 (deep distress) to +1.0 (positive/empowered).
3. Extracts primary emotion tags (e.g. "anxious", "lonely", "exhausted", "hopeful").
"""

from typing import List, Dict, Tuple
import re
from app.models.schemas import SentimentAnalysisResponse


# Emotion Lexicon mapping keywords to emotional categories
EMOTION_LEXICON: Dict[str, List[str]] = {
    "anxiety": [
        "anxious", "panic", "worried", "nervous", "scared", "fear", "dreading", 
        "overthinking", "racing thoughts", "shaking", "restless", "uneasy"
    ],
    "stress_burnout": [
        "stressed", "overwhelmed", "exhausted", "burnout", "too much work", 
        "pressure", "deadline", "swamped", "tired", "drained", "can't cope"
    ],
    "sadness_depression": [
        "sad", "depressed", "unhappy", "crying", "miserable", "lonely", 
        "hopeless", "empty", "grief", "heartbroken", "down", "gloomy"
    ],
    "anger_frustration": [
        "angry", "mad", "furious", "annoyed", "frustrated", "irritated", 
        "unfair", "hate", "resentful"
    ],
    "positive_calm": [
        "happy", "good", "great", "better", "calm", "peaceful", "relieved", 
        "grateful", "optimistic", "relaxed", "hopeful", "smiling", "content"
    ]
}

# Heuristic weights for sentiment calculation
POSITIVE_WEIGHTS = {"happy": 0.8, "great": 0.9, "calm": 0.6, "better": 0.5, "grateful": 0.7, "good": 0.4}
NEGATIVE_WEIGHTS = {"anxious": -0.6, "panic": -0.9, "stressed": -0.6, "sad": -0.7, "depressed": -0.9, "overwhelmed": -0.8}


class SentimentAnalyzer:
    """
    Heuristic and lexicon-driven emotional state analyzer.
    """

    @staticmethod
    def analyze(text: str) -> Tuple[float, List[str], str]:
        """
        Analyzes text and returns:
        - score: float between -1.0 and 1.0
        - emotions: List of detected emotional labels
        - overall_sentiment: string label ('positive', 'neutral', 'negative', 'anxious', 'stressed')
        """
        lower_text = text.lower()
        detected_emotions: List[str] = []
        sentiment_score = 0.0
        matched_words = 0

        # Scan through emotion lexicons
        for category, words in EMOTION_LEXICON.items():
            for word in words:
                if re.search(r"\b" + re.escape(word) + r"\b", lower_text):
                    if category not in detected_emotions:
                        detected_emotions.append(category)
                    
                    if word in POSITIVE_WEIGHTS:
                        sentiment_score += POSITIVE_WEIGHTS[word]
                        matched_words += 1
                    elif word in NEGATIVE_WEIGHTS:
                        sentiment_score += NEGATIVE_WEIGHTS[word]
                        matched_words += 1

        # Normalize score
        if matched_words > 0:
            sentiment_score = max(-1.0, min(1.0, sentiment_score / matched_words))
        else:
            # Baseline neutral
            sentiment_score = 0.0

        # Determine overall category label
        if "anxiety" in detected_emotions:
            overall = "anxious"
        elif "stress_burnout" in detected_emotions:
            overall = "stressed"
        elif "sadness_depression" in detected_emotions:
            overall = "sad"
        elif sentiment_score > 0.3:
            overall = "positive"
        elif sentiment_score < -0.3:
            overall = "distressed"
        else:
            overall = "neutral"

        return sentiment_score, detected_emotions, overall

    @staticmethod
    def generate_journal_insights(text: str) -> SentimentAnalysisResponse:
        """
        Generates structured insights and coping recommendations for journal entries.
        """
        score, emotions, overall = SentimentAnalyzer.analyze(text)
        
        suggestions: List[str] = []
        if "anxiety" in emotions or overall == "anxious":
            suggestions.extend([
                "Try the 4-7-8 deep breathing technique (Inhale 4s, Hold 7s, Exhale 8s).",
                "Practice the 5-4-3-2-1 sensory grounding exercise to return to the present moment."
            ])
        if "stress_burnout" in emotions or overall == "stressed":
            suggestions.extend([
                "Consider stepping away for a 10-minute walk without your phone.",
                "Identify one non-essential task today that you can postpone."
            ])
        if "sadness_depression" in emotions or overall == "sad":
            suggestions.extend([
                "Be gentle with yourself; rest is a form of healing.",
                "Consider sharing your thoughts with a trusted friend or family member."
            ])
        if not suggestions:
            suggestions.append("Keep journaling regularly! Tracking your thoughts builds self-awareness and emotional resilience.")

        return SentimentAnalysisResponse(
            sentiment=overall,
            score=round(score, 2),
            primary_emotions=emotions if emotions else ["reflective"],
            suggested_actions=suggestions
        )
