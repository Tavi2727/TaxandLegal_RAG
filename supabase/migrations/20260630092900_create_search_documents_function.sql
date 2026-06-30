CREATE OR REPLACE FUNCTION search_documents(search_query text, doc_type_filter text DEFAULT NULL, category_filter text DEFAULT NULL)
RETURNS SETOF documents
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM documents
  WHERE
    (doc_type_filter IS NULL OR doc_type = doc_type_filter)
    AND (category_filter IS NULL OR category = category_filter)
    AND (
      title ILIKE '%' || search_query || '%'
      OR content ILIKE '%' || search_query || '%'
      OR summary ILIKE '%' || search_query || '%'
      OR category ILIKE '%' || search_query || '%'
      OR jurisdiction ILIKE '%' || search_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(keywords) k WHERE k ILIKE '%' || search_query || '%'
      )
    )
  ORDER BY
    CASE WHEN title ILIKE '%' || search_query || '%' THEN 0 ELSE 1 END,
    year DESC
  LIMIT 20;
$$;
