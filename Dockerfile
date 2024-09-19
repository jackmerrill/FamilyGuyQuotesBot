##### Stage 1 #####

### Use golang:1.18 as base image for building the application
FROM golang:1.23 as builder

ARG VERSION=0.0.0

### Create new directly and set it as working directory
RUN mkdir -p /app
WORKDIR /app

### Copy Go application dependency files
COPY go.mod .
COPY go.sum .

### Setting a proxy for downloading modules
ENV GOPROXY https://proxy.golang.org,direct

### Download Go application module dependencies
RUN go mod download

### Copy actual source code for building the application
COPY . .

### CGO has to be disabled cross platform builds
### Otherwise the application won't be able to start
ENV CGO_ENABLED=0

### Build the Go app for a linux OS
### 'scratch' and 'alpine' both are Linux distributions
RUN GOOS=linux go build -ldflags="-X main.version=$(echo ${VERSION}}) -X main.Build=$(git rev-parse HEAD)" -o main .

##### Stage 2 #####

### Define the running image
FROM scratch as runner

### Alternatively to 'FROM scratch', use 'alpine':
# FROM alpine:3.13.1

### Set working directory
WORKDIR /app

### Copy built binary application from 'builder' image
COPY --from=builder /app/main .
COPY --from=builder /app/quotes.json .

### Copy the certs from builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

### Run the binary application
CMD ["/app/main"]
