# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build static Next.js app
RUN npm run build

# Install lightweight static server
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Disable lint warnings in production
ENV NEXT_DISABLE_ESLINT=true

# Serve the static export from the 'out' directory
CMD ["serve", "-s", "out", "-l", "3000"]
