# Build Stage
FROM rust:1.83-slim-bookworm as builder

WORKDIR /app

# Install dependencies for building (pkg-config, libssl-dev for native-tls)
RUN apt-get update && apt-get install -y pkg-config libssl-dev

COPY . .

# Enable SQLx offline mode
ENV SQLX_OFFLINE=true

# Build the application
RUN cargo build --release

# Runtime Stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y libssl3 ca-certificates sqlite3 && rm -rf /var/lib/apt/lists/*

# Copy binary and migrations
COPY --from=builder /app/target/release/hems-core .
COPY --from=builder /app/migrations ./migrations

# Expose port
EXPOSE 3000

# Set default env vars (can be overridden by Render)
ENV DATABASE_URL=sqlite://hems.db

# Run the binary
CMD ["./hems-core"]
