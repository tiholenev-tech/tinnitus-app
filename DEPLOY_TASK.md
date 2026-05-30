DEPLOY TASK: AURALIS PWA on shared droplet (with RunMyStore)

CONTEXT:
- Droplet: 104.248.19.8, Ubuntu 24, Apache 2.4.58, Certbot installed
- Domain: tinnitus-app.help (DNS A-record already points to 104.248.19.8)
- Repo: https://github.com/tiholenev-tech/tinnitus-app (public, main branch)
- Target path: /var/www/auralis/
- LetsEncrypt email: tiholenev@gmail.com

EXISTING vhosts - DO NOT TOUCH:
- runmystore.conf + runmystore-le-ssl.conf
- donela.bg.conf + donela.bg-le-ssl.conf
- loyalty.donela.bg.conf + loyalty.donela.bg-le-ssl.conf
- 000-default-deny.conf

STEPS:

STEP 1: Backup current state
- Save list of enabled sites to /tmp/sites_before.txt
- Save copy of /etc/apache2/apache2.conf to /tmp/apache2.conf.bak

STEP 2: Create directory and clone repo
- mkdir -p /var/www/auralis
- cd /var/www/auralis && git clone https://github.com/tiholenev-tech/tinnitus-app.git .
- chown -R www-data:www-data /var/www/auralis
- Verify with ls -la

STEP 3: Create Apache vhost file /etc/apache2/sites-available/auralis.conf

Content (HTTP only first, certbot adds SSL):

<VirtualHost *:80>
    ServerName tinnitus-app.help
    ServerAlias www.tinnitus-app.help
    DocumentRoot /var/www/auralis

    <Directory /var/www/auralis>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    AddType audio/opus .opus
    AddType audio/wav .wav
    AddType application/manifest+json .webmanifest

    <FilesMatch "\.(opus|wav|mp3)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    <FilesMatch "\.(html|json)$">
        Header set Cache-Control "no-cache, must-revalidate"
    </FilesMatch>
    <Files "service-worker.js">
        Header set Cache-Control "no-cache, no-store, must-revalidate"
        Header set Service-Worker-Allowed "/"
    </Files>

    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
    </IfModule>

    ErrorLog ${APACHE_LOG_DIR}/auralis_error.log
    CustomLog ${APACHE_LOG_DIR}/auralis_access.log combined
</VirtualHost>

STEP 4: Enable site
- a2enmod headers (if not enabled)
- a2enmod rewrite (if not enabled)
- a2ensite auralis.conf
- apache2ctl configtest (must say "Syntax OK")
- systemctl reload apache2

STEP 5: Test HTTP before SSL
- curl -I http://tinnitus-app.help
- Expected: HTTP 200, not 403/404
- If error: STOP and tell Tihol

STEP 6: SSL with LetsEncrypt
- certbot --apache -d tinnitus-app.help -d www.tinnitus-app.help --non-interactive --agree-tos --email tiholenev@gmail.com --redirect
- Verify: curl -I https://tinnitus-app.help
- Expected: HTTP 200

STEP 7: Audio placeholder directory
- mkdir -p /var/www/auralis/library_staging_compact
- chown -R www-data:www-data /var/www/auralis/library_staging_compact
- Show Tihol the exact rsync command to run FROM HIS COMPUTER:

  rsync -avz --progress C:/Users/USER/Desktop/auralis/library_staging_compact/ root@104.248.19.8:/var/www/auralis/library_staging_compact/

  (Note: on Windows use Git Bash or WSL for rsync. Alternative: scp -r library_staging_compact root@104.248.19.8:/var/www/auralis/)

STEP 8: Final verification
- curl -I https://tinnitus-app.help (should be 200)
- ls /var/www/auralis/ (should show repo files)
- apache2ctl -S (should show auralis vhost enabled)
- systemctl status apache2 (active)

CRITICAL RULES:
- DO NOT touch /var/www/runmystore/ (PRODUCTION)
- DO NOT touch /var/www/donela.bg/ (PRODUCTION)
- DO NOT touch other vhost configs
- DO NOT touch /etc/apache2/apache2.conf (main config)
- ALWAYS run apache2ctl configtest BEFORE every reload
- STOP on first error and ask Tihol
- SHOW output of every step before proceeding to next

STOP and ask Tihol if:
- Vhost already exists
- DNS does not resolve
- Certbot fails
- Apache reload fails

START WITH STEP 1. ASK BEFORE DESTRUCTIVE OPERATIONS.
