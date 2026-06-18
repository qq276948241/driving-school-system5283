package config

type Config struct {
	Port        string
	DSN         string
	JWTSecret   string
	TokenExpire int
}

func Load() *Config {
	return &Config{
		Port:        ":8000",
		DSN:         "driving_school.db",
		JWTSecret:   "driving-school-secret-key-2024",
		TokenExpire: 24,
	}
}
