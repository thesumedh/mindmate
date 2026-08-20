"""
Analysis Router: Sentiment & Journal Insights

Concept Explanation:
--------------------
In mental wellness platforms, users write private reflections and journal entries.
This endpoint provides decoupled emotional analytics:
- Quantifies mood and detects subtle indicators of anxiety, burnout, or sadness.
- Recommends grounding exercises (e.g. 5-4-3-2-1 technique, 4-7-8 breathing).
- Preserves privacy by processing data ephemerally without permanent storage.
"""

from fastapi import APIRouter, HTTPException, status
from app.models.schemas import SentimentAnalysisRequest, SentimentAnalysisResponse
from app.agent.sentiment import SentimentAnalyzer

router = APIRouter(prefix="/analyze", tags=["Sentiment & Journal Analysis"])


@router.post(
    "",
    response_model=SentimentAnalysisResponse,
    summary="Analyze Sentiment and Emotions",
    description="Evaluates emotional tone of a text string and suggests actionable coping exercises."
)
async def analyze_sentiment(request: SentimentAnalysisRequest) -> SentimentAnalysisResponse:
    """
    Analyzes input text and returns structured emotional insights and suggestions.
    """
    try:
        insights = SentimentAnalyzer.generate_journal_insights(request.text)
        return insights
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sentiment analysis failed: {str(e)}"
        )
