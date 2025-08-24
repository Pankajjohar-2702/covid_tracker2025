<?php
        // Database configuration
        define('DB_HOST', 'localhost');
        define('DB_USERNAME', 'your_username');
        define('DB_PASSWORD', 'your_password');
        define('DB_NAME', 'covid_tracker');

        // Security settings
        define('HASH_ALGORITHM', 'sha256');
        define('SESSION_TIMEOUT', 3600); // 1 hour

        // Start session
        session_start();
        ?>
       
        