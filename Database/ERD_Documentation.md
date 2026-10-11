# Database Documentation & ERD

## Entity Relationship Diagram

```mermaid
erDiagram
    SUBJECTS ||--o{ QUESTIONS : contains
    GAMES ||--o{ QUESTIONS : includes
    USERS ||--o{ PLAYER_PROGRESS : tracks
    GAMES ||--o{ PLAYER_PROGRESS : has_progress

    SUBJECTS {
        uuid id
        string name
        text description
        timestamp created_at
    }

    GAMES {
        uuid id
        string title
        string game_type
        text description
        timestamp created_at
    }

    QUESTIONS {
        uuid id
        uuid game_id
        uuid subject_id
        text question_text
        jsonb options
        string correct_answer
        text explanation
        string difficulty
        int points
        timestamp created_at
    }

    USERS {
        uuid id
        string username
        string email
        timestamp created_at
    }

    PLAYER_PROGRESS {
        uuid id
        uuid user_id
        uuid game_id
        int score
        boolean is_completed
        timestamp updated_at
    }