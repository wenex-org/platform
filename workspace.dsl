workspace "Protal Soft" "Financial Ecosystem" {
   
   model {
      user = person "User" "Manager" "Person"
      redis = softwareSystem "Redis" "Mem Storage" "Cache"
      mongo = softwareSystem "Mongo" "Doc Storage" "Storage"
      mysql = softwareSystem "MySQL" "SQL Storage" "Storage"
      rabbit = softwareSystem "RabbitMQ" "MQTT Broker" "Broker"

      old = softwareSystem "Old" "PHP Project" {
         tags "External"
      }

      old -> rabbit "Broker"
      old -> mysql "Database"
      
      group "Client" {
         ui = softwareSystem "Frontend" "Client UI" "WebApp"

         client = softwareSystem "Backend" {
            proxy = container "Proxy" "RESTful"
            agent = container "Agent" "RESTful"
         }

         agent -> rabbit "Broker"
         agent -> mysql "Database"
         agent -> mongo "Database"
         agent -> redis "Cache Manager"
      }

      platform = softwareSystem "Platform" {   
         gateway = container "Gateway" "RESTful/GraphQL" {
            tags "Gateway"
         }

         auth = container "Auth" "GRPC"
         domain = container "Domain" "GRPC"
         identity = container "Identity" "GRPC"

         touch = container "Touch" "AMQP"

         gateway -> redis "Cache Manager"
         
         auth -> mongo "Database"
         domain -> mongo "Database"
         identity -> mongo "Database"
         
         touch -> rabbit "Broker"
         touch -> mongo "Database"
      }

      sumsub = softwareSystem "Sumsub" "Identity Verification Service" "External"
      binance = softwareSystem "Binance" "Secure and Reliable Asset Exchange" "External"

      client -> sumsub "Request" "RESTful"
      client -> binance "Request" "RESTful"

      user -> ui "Interact" "Manual"
      
      ui -> proxy "Request" "RESTful"

      proxy -> agent "Request" "RESTful"
      proxy -> gateway "Request" "RESTful"

      gateway -> auth "Request" "GRPC"
      gateway -> domain "Request" "GRPC"
      gateway -> identity "Request" "GRPC"
      gateway -> touch "Request" "AMQP"

      auth -> domain "Request" "GRPC"
      auth -> identity "Request" "GRPC"
   }
   
   views {
      systemLandscape platform "system_landscape" {
         include *
         autoLayout
      }
      
      systemContext platform "platform_context" {
         include *
         autoLayout
      }

      container platform "platform_container" {
         include *
         autoLayout
      }
      
      systemContext client "client_context" {
         include *
         autoLayout
      }

      container client "client_container" {
         include *
         autoLayout
      }
      
      styles {
         element "Person" {
            color #ffffff
            background #1168bd
            shape "Person"
         }
         
         element "Element" {
            color #ffffff
            background #1168bd
            shape RoundedBox
         }

         element "External" {
            color #000000
            background #dddddd
            shape RoundedBox
         }

         element "WebApp" {
               background #ff2a8a
               color #ffffff
               shape WebBrowser
         } 

         element "Gateway" {
               background #55aa55
               shape Hexagon
         }

         element "Cache" {
               background #f48225
               shape Folder
         }
            
         element "Storage" {
               background #f48225
               shape Cylinder
         }

         element "Broker" {
               background #fbf3d5
               color #000000
               shape Pipe
         }
      }
   }
}