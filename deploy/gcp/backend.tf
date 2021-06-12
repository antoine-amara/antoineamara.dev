terraform {
  backend "gcs" {
    bucket = "antoineamaradev-tfstate"
    prefix = "gcp"
  }
}
