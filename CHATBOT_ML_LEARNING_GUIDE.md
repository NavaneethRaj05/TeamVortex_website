# VortexBot ML Learning System

## Overview
The chatbot now features a true Machine Learning system that learns from user interactions and continuously improves responses over time.

## How It Works

### 1. User Feedback Collection
- Every bot response includes thumbs up/down buttons
- Users can rate responses as helpful or not helpful
- Feedback is tracked per response with quality scores

### 2. Quality Scoring System
Each FAQ tracks:
- **Quality Score**: Percentage of positive ratings (0-100%)
- **Total Ratings**: Number of user feedback submissions
- **Positive/Negative Ratings**: Breakdown of feedback

### 3. Automatic Learning Process

#### When a user asks a question:
1. **Check Learned Interactions**: System searches previously learned responses with high confidence
2. **Match Custom FAQs**: Finds best matching FAQ using similarity scoring
3. **Auto-Generate Answers**: If no match, generates answer from similar FAQs
4. **Record Unresolved**: Tracks new questions for future learning

#### Pattern Recognition:
- Extracts common query patterns (2-3 word phrases)
- Groups similar questions together
- Identifies frequently asked topics

#### Auto-Improvement:
- After 3+ similar queries, system auto-generates FAQ suggestions
- High-confidence answers (>85%) are auto-approved
- Low-quality FAQs (<60% score) are flagged for admin review

### 4. Response Selection Intelligence
When multiple answers exist:
- Selects answer with highest quality score
- Considers alternative answers from user feedback
- Uses confidence scoring to pick best response
- Shows "Improved from user feedback" badge on learned responses

### 5. Admin Dashboard Features

#### Analytics Display:
- Total queries processed
- Resolution success rate
- Average response quality
- Positive/negative feedback ratio

#### ML Improvement Suggestions:
- **Low Quality FAQs**: Shows FAQs with poor ratings that need revision
- **Frequent Unresolved**: Highlights commonly asked questions without answers
- Provides actionable suggestions for improvement

#### FAQ Quality Indicators:
- Green badge: 70%+ quality (good)
- Yellow badge: 50-70% quality (needs attention)
- Red badge: <50% quality (requires immediate review)

## User Experience Flow

### For End Users:
1. Ask question in chatbot
2. Receive response
3. Rate response with thumbs up/down
4. System thanks user and records feedback
5. Next user asking similar question gets improved response

### For Admins:
1. View analytics dashboard
2. Review ML improvement suggestions
3. See quality scores for each FAQ
4. Edit low-quality responses
5. Approve auto-generated answers
6. Convert learned interactions to FAQs

## Key Features

### Similarity Matching:
- Uses Levenshtein distance algorithm
- Checks question similarity
- Matches keywords and related queries
- Confidence scoring (0-1 scale)

### Context Awareness:
- Tracks previous queries in session
- Considers user type (new vs returning)
- Records query patterns over time

### Continuous Improvement:
- Every feedback improves future responses
- System learns which answers work best
- Automatically adjusts to user preferences
- No manual intervention needed for most improvements

## Configuration Settings

Located in `Chatbot.settings`:
- `mlEnabled`: Enable/disable ML learning (default: true)
- `enableFeedback`: Show feedback buttons (default: true)
- `enableAutoImprovement`: Auto-improve responses (default: true)
- `autoLearnThreshold`: Create FAQ after N queries (default: 3)
- `similarityThreshold`: Minimum match score (default: 0.7)
- `minConfidenceScore`: Minimum confidence to use learned response (default: 0.6)
- `feedbackThreshold`: Min feedback before auto-improvement (default: 5)

## Technical Implementation

### Backend (Node.js/Express):
- `server/models/Chatbot.js`: Enhanced schema with ML fields
- `server/routes/chatbot.js`: ML learning endpoints
  - `/api/chatbot/query`: Process queries with ML
  - `/api/chatbot/feedback`: Record user feedback
  - `/api/chatbot/improvement-suggestions`: Get ML suggestions

### Frontend (React):
- `src/components/AIChatbot.js`: User feedback UI
- `src/components/dashboard/ChatbotManager.js`: Admin ML dashboard

## Benefits

1. **Self-Improving**: Gets better with every interaction
2. **Reduces Admin Work**: Auto-generates and approves good answers
3. **Better User Experience**: More accurate responses over time
4. **Data-Driven**: Uses actual user feedback, not assumptions
5. **Transparent**: Shows quality scores and improvement suggestions
6. **Scalable**: Handles growing knowledge base automatically

## Future Enhancements

Potential improvements:
- Natural Language Processing (NLP) integration
- Sentiment analysis on feedback comments
- Multi-language support with translation learning
- Predictive query suggestions
- A/B testing different answer variations
- Integration with external knowledge bases

---

**Note**: The system requires MongoDB to store learning data. Ensure database is properly configured and backed up regularly.
