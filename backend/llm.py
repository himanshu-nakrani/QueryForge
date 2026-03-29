"""LLM integration for natural language to SQL conversion."""
import json
from typing import Optional
from openai import OpenAI
from config import OPENAI_API_KEY

client = OpenAI(api_key=OPENAI_API_KEY)


def generate_sql_from_nl(
    natural_language: str,
    table_name: str,
    columns: list[dict],
    sample_data: Optional[str] = None,
) -> str:
    """Convert natural language to SQL using OpenAI."""
    
    # Build schema description
    schema_desc = f"Table '{table_name}' has columns:\n"
    for col in columns:
        schema_desc += f"- {col['name']} ({col['type']})\n"
    
    if sample_data:
        schema_desc += f"\nSample data:\n{sample_data}"
    
    prompt = f"""You are a SQL expert. Convert the following natural language query into a valid SQL SELECT statement.

{schema_desc}

Natural Language Query: {natural_language}

Requirements:
- Only generate SELECT queries (no INSERT, UPDATE, DELETE, DROP)
- Return ONLY the SQL query, no explanations
- Use proper SQL syntax
- The query must work with SQLite
- If the query is impossible with the given schema, return: "INVALID_QUERY"

SQL Query:"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=500,
        )
        sql = response.choices[0].message.content.strip()
        return sql
    except Exception as e:
        return f"ERROR: {str(e)}"


def validate_sql(sql: str) -> tuple[bool, Optional[str]]:
    """Validate that SQL is safe (SELECT only)."""
    sql_upper = sql.strip().upper()
    
    # Check for dangerous keywords
    dangerous_keywords = ["INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "EXEC", "EXECUTE"]
    for keyword in dangerous_keywords:
        if keyword in sql_upper:
            return False, f"Query contains dangerous keyword: {keyword}"
    
    # Must be SELECT
    if not sql_upper.startswith("SELECT"):
        return False, "Query must start with SELECT"
    
    return True, None
