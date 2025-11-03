# Use PHP 8.2 FPM base image
FROM php:8.2-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev sqlite3 libsqlite3-dev \
    && docker-php-ext-install pdo_sqlite mbstring exif pcntl bcmath gd zip

# Set working directory
WORKDIR /var/www

# Copy composer and install dependencies
COPY composer.json composer.lock ./
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --no-scripts --no-interaction

# Copy Laravel app
COPY . .

# Ensure SQLite database exists
RUN mkdir -p database && touch database/database.sqlite
RUN chown -R www-data:www-data /var/www

# Expose PHP-FPM port
EXPOSE 9000
CMD ["php-fpm"]
