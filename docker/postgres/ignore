# Simple PostgreSQL Dockerfile for Render
FROM postgres:15-alpine

# Set default environment variables
ENV POSTGRES_DB=fubs
ENV POSTGRES_USER=fubs_user
ENV POSTGRES_PASSWORD=defaultpassword

# Expose PostgreSQL port
EXPOSE 5432

# Use the default postgres entrypoint
CMD ["postgres"]
