# gcp credentials
variable "authkey" {
  description = "credential JSON filename for authentication"
  type        = string
}

variable "gcp_project_id" {
  description = "gcp project identifier for deployment"
  type        = string
}

# domain name and associated data
variable "domain" {
  description = "the domain name of the website"
  type        = string
}

# the dist configuration containing production files
variable "dist_path" {
  type        = string
  description = "the path of the dist folder containing the bundled files for the website"
  default     = "/dist/"
}

# backend functions authorized origins
variable "authorized_origins" {
  type        = string
  description = "list of origins authorized to request the gcp backend functions"
}


# the gcp function configuration containing file
variable "dist_functions_path" {
  type        = string
  description = "the path of the folder containing gcp functions"
  default     = "/functions/"
}

# contact form SMTP server configurations
variable "smtp_host" {
  description = "SMTP server host address"
  type        = string
}

variable "smtp_port" {
  description = "SMTP server destination port"
  type        = number
  default     = 25
}

variable "smtp_username" {
  description = "SMTP username for authentication"
  type        = string
}

variable "smtp_password" {
  description = "SMTP user password for authentication"
  type        = string
}

variable "mail_sender" {
  description = "SMTP mail sender"
  type        = string
  default     = "no-reply@antoineamara.dev"
}

variable "dest_mail" {
  description = "Destination mail address"
  type        = string
}

# get github profile function
variable "github_token" {
  type        = string
  description = "the authorization token for github.com to retrieve the user profile projects"
}

# get blog posts function
variable "dev_api_key" {
  type        = string
  description = "the authorization token for dev.to to retrieve the blog posts"
}
