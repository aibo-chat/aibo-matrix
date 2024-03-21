# Use the official Node.js image with the desired version
FROM node:19.9.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the application code to the working directory
COPY . .

# Expose the port on which your Node.js application will run
EXPOSE 8070

# Define the command to run your Node.js application
CMD ["node", "bin/www"]
