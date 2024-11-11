# Use the official nginx image
FROM nginx:alpine

# Create two demo pages
RUN echo "<h1>Demo Page 1</h1>" > /usr/share/nginx/html/index1.html && \
    echo "<h1>Demo Page 2</h1>" > /usr/share/nginx/html/index2.html

# Configure nginx to serve pages on different ports
RUN echo 'server { \
            listen 8080; \
            location / { \
                root /usr/share/nginx/html; \
                index index1.html; \
            } \
        } \
        server { \
            listen 8081; \
            location / { \
                root /usr/share/nginx/html; \
                index index2.html; \
            } \
        }' > /etc/nginx/conf.d/default.conf

# Expose both ports
EXPOSE 8080 8081

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]