 <?php
        require_once 'config.php';

        class CovidDatabase {
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
            
            public function addPatient($name, $country, $status) {
                try {
                    $stmt = $this->connection->prepare(
                        "INSERT INTO covid_data (name, country, status, created_at) VALUES (?, ?, ?, NOW())"
                    );
                    $stmt->execute([$name, $country, $status]);
                    return ['success' => true, 'message' => 'Patient added successfully'];
                } catch(PDOException $e) {
                    return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
                }
            }
            
            public function getPatients() {
                try {
                    $stmt = $this->connection->prepare("SELECT * FROM covid_data ORDER BY created_at DESC");
                    $stmt->execute();
                    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    return ['success' => true, 'data' => $patients];
                } catch(PDOException $e) {
                    return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
                }
            }
            
            public function removePatient($id) {
                try {
                    $stmt = $this->connection->prepare("DELETE FROM covid_data WHERE id = ?");
                    $stmt->execute([$id]);
                    return ['success' => true, 'message' => 'Patient removed successfully'];
                } catch(PDOException $e) {
                    return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
                }
            }
        }

        // Handle AJAX requests
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $db = new CovidDatabase();
            $action = $_POST['action'] ?? '';
            
            switch($action) {
                case 'add_patient':
                    $result = $db->addPatient($_POST['name'], $_POST['country'], $_POST['status']);
                    break;
                case 'get_patients':
                    $result = $db->getPatients();
                    break;
                case 'remove_patient':
                    $result = $db->removePatient($_POST['patient_id']);
                    break;
                default:
                    $result = ['success' => false, 'message' => 'Invalid action'];
            }
            
            header('Content-Type: application/json');
            echo json_encode($result);
        }
        ?>
