# QueryForge - Natural Language to SQL Query Builder

QueryForge is a full-stack application that allows you to upload CSV files and query them using natural language. The app converts your questions to SQL using OpenAI's API and safely executes them.

## Features

- **File Upload**: Drag-and-drop CSV file upload with automatic schema detection
- **Natural Language Queries**: Ask questions about your data in plain English
- **LLM-Powered SQL Generation**: Uses OpenAI GPT-3.5-turbo to convert natural language to SQL
- **Safety Layer**: Only allows SELECT queries, prevents SQL injection
- **Query History**: Keep track of all your queries and results
- **Beautiful UI**: Modern, dark-mode ready interface with shadcn/ui

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: FastAPI, SQLAlchemy, SQLite, Pandas, OpenAI API
- **Database**: SQLite for storing uploaded data and query history

## Setup Instructions

### 1. Install Dependencies

```bash
# Install Python dependencies
uv add -r pyproject.toml

# Install Node.js dependencies
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your OpenAI API key:
```
OPENAI_API_KEY=sk_your_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Run the Backend

```bash
cd backend
uv run python -m uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API docs: `http://localhost:8000/docs`

### 4. Run the Frontend

In a new terminal:

```bash
pnpm dev
```

The frontend will be available at `http://localhost:3000`

## How to Use

1. **Upload Data**: Drag a CSV file into the upload area or click to select one
2. **Select Table**: Choose the uploaded table from the available tables
3. **View Schema**: See the column names and types of your table
4. **Ask Questions**: Type a natural language question in the chat interface
5. **View Results**: The app generates SQL and shows the results in a table

## Example Queries

- "Show me all records from 2024"
- "What's the average price by category?"
- "Find all customers from New York"
- "How many transactions happened last month?"

## API Endpoints

- `POST /upload` - Upload a CSV file
- `GET /tables` - List all available tables
- `GET /schema/{table_name}` - Get schema information for a table
- `POST /query` - Generate and execute a query from natural language
- `GET /history` - Get query history
- `GET /` - Health check

## Safety & Security

- Only SELECT queries are allowed (INSERT, UPDATE, DELETE, DROP, CREATE are blocked)
- Queries are validated before execution
- API CORS is configured to only accept requests from frontend
- All user inputs are sanitized

## Project Structure

```
QueryForge/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── file-upload-panel.tsx
│   ├── schema-viewer.tsx
│   ├── chat-interface.tsx
│   └── query-results.tsx
├── hooks/                 # Custom React hooks
│   └── use-query-forge.ts
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI app
│   ├── models.py         # SQLAlchemy models
│   ├── database.py       # Database utilities
│   ├── llm.py            # LLM integration
│   └── config.py         # Configuration
└── data/                  # Data files (uploads, database)
```

## Troubleshooting

### CORS Errors
Make sure the backend is running on `http://localhost:8000` and frontend on `http://localhost:3000`. Update `NEXT_PUBLIC_API_URL` if using different ports.

### OpenAI API Errors
Verify your API key is correct and has sufficient credits. Check `http://localhost:8000/docs` for API responses.

### Database Errors
Delete the `data/queryforge.db` file to reset the database if you encounter migration issues.

## Future Enhancements

- Support for multiple database types (PostgreSQL, MySQL)
- Real-time query execution with streaming results
- Advanced schema introspection and data type handling
- Custom SQL templates and saved queries
- Team collaboration features
- Query performance analytics

## License

MIT
