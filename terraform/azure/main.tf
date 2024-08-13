provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "example" {
  name     = "example-resources"
  location = "East US"
}

# Storage Account for Azure Function App
resource "azurerm_storage_account" "example" {
  name                     = "examplestorageacct"
  resource_group_name      = azurerm_resource_group.example.name
  location                 = azurerm_resource_group.example.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

# App Service Plan for Azure Function App
resource "azurerm_app_service_plan" "example" {
  name                = "example-service-plan"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

# Managed Identity for Azure Functions
resource "azurerm_user_assigned_identity" "example_identity" {
  name                = "example-identity"
  resource_group_name = azurerm_resource_group.example.name
  location            = azurerm_resource_group.example.location
}

# Example Azure Function App
resource "azurerm_function_app" "example_lambda" {
  name                       = "example-function-app"
  location                   = azurerm_resource_group.example.location
  resource_group_name        = azurerm_resource_group.example.name
  app_service_plan_id        = azurerm_app_service_plan.example.id
  storage_account_name       = azurerm_storage_account.example.name
  storage_account_access_key = azurerm_storage_account.example.primary_access_key
  identity {
    type          = "UserAssigned"
    identity_ids  = [azurerm_user_assigned_identity.example_identity.id]
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    "DYNAMODB_TABLE_NAME"      = "example-table"
  }
}

# Additional Azure Function Apps for GET, PUT, DELETE
resource "azurerm_function_app" "example_lambda_get_part" {
  name                       = "example-get-function-app"
  location                   = azurerm_resource_group.example.location
  resource_group_name        = azurerm_resource_group.example.name
  app_service_plan_id        = azurerm_app_service_plan.example.id
  storage_account_name       = azurerm_storage_account.example.name
  storage_account_access_key = azurerm_storage_account.example.primary_access_key
  identity {
    type          = "UserAssigned"
    identity_ids  = [azurerm_user_assigned_identity.example_identity.id]
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    "DYNAMODB_TABLE_NAME"      = "example-table"
  }
}

resource "azurerm_function_app" "example_lambda_put_part" {
  name                       = "example-put-function-app"
  location                   = azurerm_resource_group.example.location
  resource_group_name        = azurerm_resource_group.example.name
  app_service_plan_id        = azurerm_app_service_plan.example.id
  storage_account_name       = azurerm_storage_account.example.name
  storage_account_access_key = azurerm_storage_account.example.primary_access_key
  identity {
    type          = "UserAssigned"
    identity_ids  = [azurerm_user_assigned_identity.example_identity.id]
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    "DYNAMODB_TABLE_NAME"      = "example-table"
  }
}

resource "azurerm_function_app" "example_lambda_delete_part" {
  name                       = "example-delete-function-app"
  location                   = azurerm_resource_group.example.location
  resource_group_name        = azurerm_resource_group.example.name
  app_service_plan_id        = azurerm_app_service_plan.example.id
  storage_account_name       = azurerm_storage_account.example.name
  storage_account_access_key = azurerm_storage_account.example.primary_access_key
  identity {
    type          = "UserAssigned"
    identity_ids  = [azurerm_user_assigned_identity.example_identity.id]
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    "DYNAMODB_TABLE_NAME"      = "example-table"
  }
}

# Azure API Management
resource "azurerm_api_management" "example_api" {
  name                = "example-api-management"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  publisher_name      = "YourCompanyName"
  publisher_email     = "email@example.com"
  sku_name            = "Developer_1"
}

# API Definitions
resource "azurerm_api_management_api" "example_api" {
  name                = "example-api"
  resource_group_name = azurerm_resource_group.example.name
  api_management_name = azurerm_api_management.example_api.name
  revision            = "1"
  display_name        = "Example API"
  path                = "example-api"
  protocols           = ["https"]
}

# POST API Operation
resource "azurerm_api_management_api_operation" "post_operation" {
  operation_id        = "postOperation"
  api_name            = azurerm_api_management_api.example_api.name
  api_management_name = azurerm_api_management.example_api.name
  resource_group_name = azurerm_resource_group.example.name
  display_name        = "POST Operation"
  method              = "POST"
  url_template        = "/example_lambda_try_part"

  response {
    status_code  = 200
    description  = "OK"
  }
}

# GET API Operation
resource "azurerm_api_management_api_operation" "get_operation" {
  operation_id        = "getOperation"
  api_name            = azurerm_api_management_api.example_api.name
  api_management_name = azurerm_api_management.example_api.name
  resource_group_name = azurerm_resource_group.example.name
  display_name        = "GET Operation"
  method              = "GET"
  url_template        = "/get_example_lambda_try_part"

  response {
    status_code  = 200
    description  = "OK"
  }
}

# PUT API Operation
resource "azurerm_api_management_api_operation" "put_operation" {
  operation_id        = "putOperation"
  api_name            = azurerm_api_management_api.example_api.name
  api_management_name = azurerm_api_management.example_api.name
  resource_group_name = azurerm_resource_group.example.name
  display_name        = "PUT Operation"
  method              = "PUT"
  url_template        = "/put_example_lambda_try_part"

  response {
    status_code  = 200
    description  = "OK"
  }
}

# DELETE API Operation
resource "azurerm_api_management_api_operation" "delete_operation" {
  operation_id        = "deleteOperation"
  api_name            = azurerm_api_management_api.example_api.name
  api_management_name = azurerm_api_management.example_api.name
  resource_group_name = azurerm_resource_group.example.name
  display_name        = "DELETE Operation"
  method              = "DELETE"
  url_template        = "/delete_example_lambda_try_part"

  response {
    status_code  = 200
    description  = "OK"
  }
}

# Cosmos DB for Azure equivalent to DynamoDB
resource "azurerm_cosmosdb_account" "example" {
  name                = "examplecosmosdb"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  consistency_policy {
    consistency_level = "Session"
  }
  geo_location {
    location          = azurerm_resource_group.example.location
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_sql_database" "example_database" {
  name                = "example-database"
  resource_group_name = azurerm_resource_group.example.name
  account_name        = azurerm_cosmosdb_account.example.name
}

resource "azurerm_cosmosdb_sql_container" "example_container" {
  name                = "example-container"
  resource_group_name = azurerm_resource_group.example.name
  account_name        = azurerm_cosmosdb_account.example.name
  database_name       = azurerm_cosmosdb_sql_database.example_database.name
  throughput          = 400

  unique_key {
    paths = ["/name"]
  }

  unique_key {
    paths = ["/description"]
  }
}
