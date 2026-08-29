variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "teachstack"
}

variable "db_password" {
  description = "RDS Postgres master password"
  type        = string
  sensitive   = true
  default     = "TeachStackSecretPass2026!"
}
