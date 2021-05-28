# website bucket outputs infos
output "website_domain_name" {
  value       = google_storage_bucket.website_bucket.name
  description = "the website domain name (it is the bucket name too)."
}

# website network configurations outputs
output "website_ip" {
  value       = google_compute_global_address.website_external_ip.address
  description = "the website external IP"
}

output "website_configurations" {
  value       = google_storage_bucket.website_bucket.website
  description = "website index and 404 error file configuration"
}

# submit contact form URL
output "submit_contact_form_https_url" {
  value       = google_cloudfunctions_function.submit_contact_form_function.https_trigger_url
  description = "the https url to call to submit the contact form."
}

# get github profile URL
output "get_github_profile_https_url" {
  value       = google_cloudfunctions_function.get_github_profile_function.https_trigger_url
  description = "the https url to retrieve the github profile projects."
}

# get github profile URL
output "get_blog_posts_https_url" {
  value       = google_cloudfunctions_function.get_blog_posts_function.https_trigger_url
  description = "the https url to retrieve the blog posts from dev.to."
}
