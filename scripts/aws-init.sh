#!/bin/sh

set -e

echo "Initializing Floci..."

AWS="aws --endpoint-url=http://localhost:4566 --region us-east-1"

# =========================
# S3
# =========================

echo "Creating S3 bucket..."

$AWS s3 mb s3://chasis-local


# =========================
# SQS
# =========================

echo "Creating SQS queue..."

$AWS sqs create-queue \
  --queue-name chasis-local-queue


# =========================
# Secrets Manager
# =========================

echo "Creating Secrets Manager secret..."

$AWS secretsmanager create-secret \
  --name chasis-local \
  --description "Local configuration for Chasis" \
  --secret-string '{"ENVIRONMENT":"local"}'


# =========================
# EventBridge
# =========================

echo "Creating EventBridge bus..."

$AWS events create-event-bus \
  --name chasis-local


# =========================
# Parameter Store
# =========================

echo "Creating Parameter Store parameters..."

PARAM_BASE="/chasis/local"

$AWS ssm put-parameter \
  --name "${PARAM_BASE}/ENABLE_SWAGGER" \
  --value "true" \
  --type "String"

$AWS ssm put-parameter \
  --name "${PARAM_BASE}/LOG_LEVEL" \
  --value "debug" \
  --type "String"

$AWS ssm put-parameter \
  --name "${PARAM_BASE}/HTTP_TIME_OUT" \
  --value "20000" \
  --type "String"

echo "Parameter Store configuration completed."

echo "Creating DynamoDB table..."

$AWS dynamodb create-table \
  --table-name chasis-users \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
  --key-schema \
    AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

echo "DynamoDB table created."

echo "Floci initialization completed."