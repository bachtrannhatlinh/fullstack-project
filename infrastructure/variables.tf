variable "db_password" {
  description = "Password for the RDS PostgreSQL instance"
  type        = string
  sensitive   = true
}

variable "docdb_password" {
  description = "Password for the DocumentDB cluster"
  type        = string
  sensitive   = true
}
