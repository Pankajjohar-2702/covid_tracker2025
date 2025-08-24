<?php
        require_once 'config.php';

        class Authentication {
            private $connection;
            
            public function __construct() {
                try {
                    $this->connection = new PDO(
                        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
                        DB_USERNAME,
                        DB_PASSWORD,
                        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                    );
                } catch(PDOException $e) {
                    die("Connection failed: " . $e->getMessage());
                }
            }
            
            public function login($username, $password) {
                try {
                    $stmt = $this->connection->prepare(
                        "SELECT id, username, password_hash, role FROM users WHERE username = ?"
                    );
                    $stmt->execute([$username]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($user && password_verify($password, $user['password_hash'])) {
                        $_SESSION['user_id'] = $user['id'];
                        $_SESSION['username'] = $user['username'];
                        $_SESSION['role'] = $user['role'];
                        $_SESSION['login_time'] = time();
                        
                        return [
                            'success' => true,
                            'user' => [
                                'username' => $user['username'],
                                'role' => $user['role']
                            ]
                        ];
                    } else {
                        return ['success' => false, 'message' => 'Invalid credentials'];
                    }
                } catch(PDOException $e) {
                    return ['success' => false, 'message' => 'Database error'];
                }
            }
        }

        // Handle login request
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'login') {
            $auth = new Authentication();
            $result = $auth->login($_POST['username'], $_POST['password']);
            
            header('Content-Type: application/json');
            echo json_encode($result);
        }
        ?>
