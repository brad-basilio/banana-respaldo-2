# Constructor - Creador de Páginas E-commerce

Un creador de páginas e-commerce con arrastrar y soltar que te permite crear tiendas en línea completas mediante el ensamblaje de componentes prediseñados.

## Características
-   Interfaz de arrastrar y soltar
-   Componentes e-commerce prediseñados
-   Diseño responsivo
-   Vista previa en tiempo real
-   Personalización de componentes
-   Múltiples opciones de diseño

## Requisitos Previos
-   PHP >= 8.1
-   Composer
-   Node.js & NPM
-   MySQL
-   XAMPP/Apache

## Instalación

1. Clone el repositorio:
```bash
git clone https://github.com/Mundo-Web/build.git
```

2. Instalar dependencias de PHP:
```bash
composer install
```

3. Crear archivo de configuración:
```bash
cp .env.example .env
```

4. Configurar variables de entorno:
```bash
APP_NAME="Your Application Name"
APP_ENV=local
APP_CORRELATIVE="your_application_name"
```

5. Generar clave de aplicación:
```bash
php artisan key:generate
```

6. Correr migraciones de la base de datos:
```bash
php artisan migrate
```

1. Crear enlaces simbólicos:

1.1. Windows:
```bash
mklink /J "public\storage\images" "..\..\storage\app\images"
mklink /J "public\cloud" "storage\app\images\repository"
```

1.2. Linux:
```bash
ln -s storage/app/images public/storage/images
ln -s storage/app/images/repository public/cloud
```

2. Establecer permisos:
```bash
chmod -R 777 storage/
chmod -R 777 bootstrap/cache/
chmod -R 777 public/storage/
```

## Nginx Configuration (Solo VPS)

1. Crear un archivo de configuración para Nginx en `/etc/nginx/sites-available/[domain].conf`:
```conf
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ .php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /.(?!well-known).\* {
        deny all;
    }
}
```

2. Ejecutar Nginx Certbot:
```bash
sudo certbot --nginx -d your-domain.com
```	

2. Testear la configuración:
```bash
sudo nginx -t
```

3. Reiniciar Nginx:
```bash
sudo systemctl restart nginx
```