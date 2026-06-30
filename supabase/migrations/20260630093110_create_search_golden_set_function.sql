CREATE OR REPLACE FUNCTION search_golden_set(
  search_query text,
  search_type_filter text DEFAULT NULL,
  difficulty_filter text DEFAULT NULL,
  page_offset int DEFAULT 0,
  page_limit int DEFAULT 10
)
RETURNS SETOF golden_set
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM golden_set
  WHERE
    (search_type_filter IS NULL OR search_type = search_type_filter)
    AND (difficulty_filter IS NULL OR difficulty = difficulty_filter)
    AND (
      search_query = ''
      OR query ILIKE '%' || search_query || '%'
      OR answer ILIKE '%' || search_query || '%'
      OR category ILIKE '%' || search_query || '%'
    )
  ORDER BY created_at DESC
  LIMIT page_limit
  OFFSET page_offset;
$$;
