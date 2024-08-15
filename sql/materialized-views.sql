-- Conversations -----------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS conversation_count_by_date_client;
CREATE MATERIALIZED VIEW conversation_count_by_date_client AS
SELECT
    c."clientId",
    cl."name" AS client_name,
    DATE(c."createdAt") AS event_date,
    COUNT(*) AS event_count
FROM
    "Conversation" c
JOIN
    "Client" cl ON c."clientId" = cl."id"
GROUP BY
    c."clientId", cl."name", DATE(c."createdAt");

REFRESH MATERIALIZED VIEW conversation_count_by_date_client;
----------------------------------------------------------------------


-- Messages ----------------------------------------------------------
DROP MATERIALIZED VIEW IF EXISTS message_count_by_date_client;
CREATE MATERIALIZED VIEW message_count_by_date_client AS
SELECT
    c."clientId",
    cl."name" AS client_name,
    DATE(m."createdAt") AS event_date,
    COUNT(m.id) AS event_count
FROM
    "Message" m
JOIN
    "Conversation" c ON m."conversationId" = c."id"
JOIN
    "Client" cl ON c."clientId" = cl."id"
GROUP BY
    c."clientId", cl."name", DATE(m."createdAt");

REFRESH MATERIALIZED VIEW message_count_by_date_client;

----------------------------------------------------------------------