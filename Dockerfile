# Use the official Python 3.11 image as the base
FROM python:3.11-slim

# Set the working directory to /app
WORKDIR /app

# Copy the requirements file into the container
COPY backend/requirements.txt .

# Install the Python dependencies (no-cache-dir keeps the docker image smaller)
RUN pip install --no-cache-dir -r requirements.txt

# Hugging Face Spaces absolutely require the app to run on port 7860
ENV PORT=7860

# Copy the rest of the application files into the container
# Hugging Face runs Docker from the root of your repo, so we copy everything in
COPY . .

# Expose port 7860 to the outside world
EXPOSE 7860

# Command to run the application using uvicorn, forced to port 7860
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
