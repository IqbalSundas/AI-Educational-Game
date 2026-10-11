# Database Documentation & ERD

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    subjects ||--o{ questions : "contains"
    games ||--o{ questions : "includes"
    users ||--o{ player_progress : "tracks"
    games ||--o{ player_progress : "has_progress"

    subjects {
        uuid id PK
        string name
        text description
        timestamp created_at
    }

    games {
        uuid id PK
        string title
        string game_type
        text description
        timestamp created_at
    }

    questions {
        uuid id PK
        uuid game_id FK
        uuid subject_id FK
        text question_text
        jsonb options
        string correct_answer
        text explanation
        string difficulty
        int points
        timestamp created_at
    }

    users {
        uuid id PK
        string username
        string email
        timestamp created_at
    }

    player_progress {
        uuid id PK
        uuid user_id FK
        uuid game_id FK
        int score
        boolean is_completed
        timestamp updated_at
    }