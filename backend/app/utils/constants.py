ALLOWED_RESUME_EXTENSIONS = {".pdf", ".docx", ".txt"}
ALLOWED_RESUME_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
}

DEFAULT_STOPWORDS = {
    "and", "or", "the", "a", "an", "to", "of", "in", "for", "with", "on", "at",
}

# Known skill/technology vocabulary. Both resumes and job descriptions are
# matched against this SAME list, so the overlap between them means something.
SKILLS_DB = [
    "python", "django", "django rest framework", "flask", "fastapi",
    "javascript", "typescript", "react", "react.js", "redux", "redux toolkit",
    "node.js", "express", "next.js", "vue", "angular",
    "html", "css", "sass", "bootstrap", "tailwind",
    "sql", "mysql", "postgresql", "sqlite", "mongodb", "redis",
    "rest api", "graphql", "microservices",
    "git", "github", "gitlab", "ci/cd", "jenkins",
    "docker", "kubernetes", "aws", "azure", "gcp", "render", "vercel", "netlify", "heroku",
    "linux", "bash", "nginx",
    "celery", "rabbitmq", "kafka",
    "jwt", "oauth", "authentication", "authorization",
    "unit testing", "pytest", "junit", "selenium",
    "agile", "scrum", "jira",
    "machine learning", "deep learning", "nlp", "pandas", "numpy", "tensorflow", "pytorch",
    "java", "c++", "c#", "go", "ruby",
    "data structures", "algorithms", "object oriented programming", "oop",
    "html5", "css3", "webpack", "vite",
    "firebase", "twilio", "stripe",
]