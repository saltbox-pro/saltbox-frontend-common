/**
 * Test SLS examples for SlsEditor component
 *
 * These examples contain example SLS files with embedded JSON schemas
 * used for testing and storybook demonstrations.
 */

/**
 * Basic file management SLS with action selection (write/append/absent)
 */
export const exampleFileManagementSls = `{#start_schema
{
  "json_schema": {
    "type": "object",
    "title": "File Management",
    "additionalProperties": false,
    "required": ["kwargs"],
    "properties": {
      "kwargs": {
        "type": "object",
        "additionalProperties": false,
        "required": ["pillar"],
        "properties": {
          "pillar": {
            "type": "object",
            "required": ["action", "name"],
            "properties": {
              "action": {
                "type": "string",
                "default": "write",
                "oneOf": [
                  { "title": "Write contents to file", "const": "write" },
                  { "title": "Append lines", "const": "append" },
                  { "title": "Remove file", "const": "absent" }
                ]
              },
              "name": {
                "type": "string",
                "pattern": "^(/|[a-zA-Z]:\\\\\\\\).+",
                "title": "File path"
              },
              "contents": {
                "type": "string",
                "title": "File contents"
              }
            },
            "allOf": [
              {
                "if": {
                  "properties": { "action": { "const": "write" } }
                },
                "then": {
                  "required": ["contents"]
                }
              }
            ]
          }
        }
      }
    }
  },
  "ui_schema": {
    "kwargs": {
      "ui:title": "",
      "pillar": {
        "ui:title": "",
        "ui:order": ["action", "name", "*"],
        "action": {
          "ui:title": "Choose action",
          "ui:widget": "select"
        },
        "name": {
          "ui:title": "File path",
          "ui:autofocus": true
        },
        "contents": {
          "ui:widget": "textarea",
          "ui:options": { "rows": 10 }
        }
      }
    }
  }
}
end_schema#}

{% set action = pillar.action %}
{% set name = pillar.name %}
{% set contents = pillar.get('contents', '') %}

Perform file operation:
{% if action == 'write' %}
  file.managed:
    - contents: {{ contents.split('\\n') }}
    - makedirs: True
{% elif action == 'append' %}
  file.append:
    - text: {{ contents.split('\\n') }}
{% elif action == 'absent' %}
  file.absent:
{% endif %}
    - name: {{ name }}
`;

/**
 * User management SLS with nested schema (profile.address.city)
 */
export const exampleUserManagementSls = `{#start_schema
{
  "json_schema": {
    "type": "object",
    "title": "User Management",
    "additionalProperties": false,
    "required": ["kwargs"],
    "properties": {
      "kwargs": {
        "type": "object",
        "additionalProperties": false,
        "required": ["pillar"],
        "properties": {
          "pillar": {
            "type": "object",
            "required": ["username"],
            "properties": {
              "username": {
                "type": "string",
                "title": "Username"
              },
              "profile": {
                "type": "object",
                "title": "User Profile",
                "properties": {
                  "firstName": {
                    "type": "string",
                    "title": "First Name"
                  },
                  "lastName": {
                    "type": "string",
                    "title": "Last Name"
                  },
                  "email": {
                    "type": "string",
                    "format": "email",
                    "title": "Email"
                  },
                  "address": {
                    "type": "object",
                    "title": "Address",
                    "properties": {
                      "street": {
                        "type": "string",
                        "title": "Street"
                      },
                      "city": {
                        "type": "string",
                        "title": "City"
                      },
                      "country": {
                        "type": "string",
                        "title": "Country"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "ui_schema": {
    "kwargs": {
      "ui:title": "",
      "pillar": {
        "ui:title": "",
        "profile": {
          "email": {
            "ui:widget": "email"
          }
        }
      }
    }
  }
}
end_schema#}

{% set username = pillar.username %}
{% set firstName = pillar.profile.firstName %}
{% set city = pillar.profile.address.city %}

user.present:
  - name: {{ username }}
  - fullname: {{ firstName }}
  - home: /home/{{ username }}
  - createhome: True
`;

/**
 * Comprehensive server configuration SLS with extensive nested structure
 * Tests scrolling behavior and handling of very long forms
 */
export const exampleServerConfigSls = `{#start_schema
{
  "json_schema": {
    "type": "object",
    "title": "Server Configuration",
    "additionalProperties": false,
    "required": ["kwargs"],
    "properties": {
      "kwargs": {
        "type": "object",
        "additionalProperties": false,
        "required": ["pillar"],
        "properties": {
          "pillar": {
            "type": "object",
            "required": ["serverName", "environment"],
            "properties": {
              "serverName": {
                "type": "string",
                "title": "Server Name",
                "description": "Unique server identifier"
              },
              "environment": {
                "type": "string",
                "title": "Environment",
                "enum": ["development", "staging", "production"],
                "default": "development"
              },
              "networkConfig": {
                "type": "object",
                "title": "Network Configuration",
                "required": ["ipAddress"],
                "properties": {
                  "ipAddress": {
                    "type": "string",
                    "title": "IP Address",
                    "pattern": "^(?:[0-9]{1,3}\\\\.){3}[0-9]{1,3}$"
                  },
                  "subnet": {
                    "type": "string",
                    "title": "Subnet Mask"
                  },
                  "gateway": {
                    "type": "string",
                    "title": "Default Gateway"
                  },
                  "dnsServers": {
                    "type": "array",
                    "title": "DNS Servers",
                    "items": {
                      "type": "string"
                    }
                  }
                }
              },
              "hardwareSpecs": {
                "type": "object",
                "title": "Hardware Specifications",
                "properties": {
                  "cpu": {
                    "type": "object",
                    "title": "CPU",
                    "properties": {
                      "cores": {
                        "type": "integer",
                        "title": "CPU Cores",
                        "minimum": 1,
                        "maximum": 128
                      },
                      "model": {
                        "type": "string",
                        "title": "CPU Model"
                      }
                    }
                  },
                  "memory": {
                    "type": "object",
                    "title": "Memory",
                    "properties": {
                      "sizeGB": {
                        "type": "integer",
                        "title": "RAM Size (GB)",
                        "minimum": 1
                      },
                      "type": {
                        "type": "string",
                        "title": "Memory Type",
                        "enum": ["DDR3", "DDR4", "DDR5"]
                      }
                    }
                  },
                  "storage": {
                    "type": "array",
                    "title": "Storage Devices",
                    "items": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "title": "Storage Type",
                          "enum": ["SSD", "HDD", "NVMe"]
                        },
                        "sizeGB": {
                          "type": "integer",
                          "title": "Size (GB)"
                        },
                        "mountPoint": {
                          "type": "string",
                          "title": "Mount Point"
                        }
                      }
                    }
                  }
                }
              },
              "services": {
                "type": "array",
                "title": "Services to Install",
                "items": {
                  "type": "object",
                  "required": ["name"],
                  "properties": {
                    "name": {
                      "type": "string",
                      "title": "Service Name"
                    },
                    "version": {
                      "type": "string",
                      "title": "Version"
                    },
                    "port": {
                      "type": "integer",
                      "title": "Port",
                      "minimum": 1,
                      "maximum": 65535
                    },
                    "autoStart": {
                      "type": "boolean",
                      "title": "Auto Start",
                      "default": true
                    },
                    "config": {
                      "type": "object",
                      "title": "Service Configuration",
                      "properties": {
                        "workers": {
                          "type": "integer",
                          "title": "Worker Processes"
                        },
                        "logLevel": {
                          "type": "string",
                          "title": "Log Level",
                          "enum": ["debug", "info", "warning", "error"]
                        }
                      }
                    }
                  }
                }
              },
              "securitySettings": {
                "type": "object",
                "title": "Security Settings",
                "properties": {
                  "firewall": {
                    "type": "object",
                    "title": "Firewall Configuration",
                    "properties": {
                      "enabled": {
                        "type": "boolean",
                        "title": "Enable Firewall",
                        "default": true
                      },
                      "allowedPorts": {
                        "type": "array",
                        "title": "Allowed Ports",
                        "items": {
                          "type": "integer"
                        }
                      },
                      "blockedIPs": {
                        "type": "array",
                        "title": "Blocked IP Addresses",
                        "items": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "sshConfig": {
                    "type": "object",
                    "title": "SSH Configuration",
                    "properties": {
                      "port": {
                        "type": "integer",
                        "title": "SSH Port",
                        "default": 22
                      },
                      "permitRootLogin": {
                        "type": "boolean",
                        "title": "Permit Root Login",
                        "default": false
                      },
                      "passwordAuth": {
                        "type": "boolean",
                        "title": "Password Authentication",
                        "default": false
                      }
                    }
                  }
                }
              },
              "monitoring": {
                "type": "object",
                "title": "Monitoring & Alerts",
                "properties": {
                  "enabled": {
                    "type": "boolean",
                    "title": "Enable Monitoring",
                    "default": true
                  },
                  "metricsEndpoint": {
                    "type": "string",
                    "title": "Metrics Endpoint URL"
                  },
                  "alertEmail": {
                    "type": "string",
                    "title": "Alert Email",
                    "format": "email"
                  },
                  "thresholds": {
                    "type": "object",
                    "title": "Alert Thresholds",
                    "properties": {
                      "cpuPercent": {
                        "type": "integer",
                        "title": "CPU Usage (%)",
                        "minimum": 0,
                        "maximum": 100,
                        "default": 80
                      },
                      "memoryPercent": {
                        "type": "integer",
                        "title": "Memory Usage (%)",
                        "minimum": 0,
                        "maximum": 100,
                        "default": 90
                      },
                      "diskPercent": {
                        "type": "integer",
                        "title": "Disk Usage (%)",
                        "minimum": 0,
                        "maximum": 100,
                        "default": 85
                      }
                    }
                  }
                }
              },
              "backupSettings": {
                "type": "object",
                "title": "Backup Configuration",
                "properties": {
                  "enabled": {
                    "type": "boolean",
                    "title": "Enable Backups",
                    "default": true
                  },
                  "schedule": {
                    "type": "string",
                    "title": "Backup Schedule (cron)",
                    "default": "0 2 * * *"
                  },
                  "retentionDays": {
                    "type": "integer",
                    "title": "Retention Period (days)",
                    "minimum": 1,
                    "default": 30
                  },
                  "destination": {
                    "type": "object",
                    "title": "Backup Destination",
                    "properties": {
                      "type": {
                        "type": "string",
                        "title": "Destination Type",
                        "enum": ["local", "s3", "ftp"]
                      },
                      "path": {
                        "type": "string",
                        "title": "Destination Path"
                      },
                      "credentials": {
                        "type": "object",
                        "title": "Credentials",
                        "properties": {
                          "username": {
                            "type": "string",
                            "title": "Username"
                          },
                          "password": {
                            "type": "string",
                            "title": "Password"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "customSettings": {
                "type": "object",
                "title": "Custom Settings",
                "description": "Additional custom configuration",
                "additionalProperties": true
              },
              "databaseConfig": {
                "type": "object",
                "title": "Database Configuration",
                "properties": {
                  "enabled": {
                    "type": "boolean",
                    "title": "Enable Database",
                    "default": false
                  },
                  "engine": {
                    "type": "string",
                    "title": "Database Engine",
                    "enum": ["postgresql", "mysql", "mongodb", "redis", "elasticsearch"]
                  },
                  "version": {
                    "type": "string",
                    "title": "Database Version"
                  },
                  "host": {
                    "type": "string",
                    "title": "Database Host",
                    "default": "localhost"
                  },
                  "port": {
                    "type": "integer",
                    "title": "Database Port"
                  },
                  "database": {
                    "type": "string",
                    "title": "Database Name"
                  },
                  "username": {
                    "type": "string",
                    "title": "Database Username"
                  },
                  "password": {
                    "type": "string",
                    "title": "Database Password"
                  },
                  "connectionPool": {
                    "type": "object",
                    "title": "Connection Pool Settings",
                    "properties": {
                      "minConnections": {
                        "type": "integer",
                        "title": "Minimum Connections",
                        "default": 5
                      },
                      "maxConnections": {
                        "type": "integer",
                        "title": "Maximum Connections",
                        "default": 20
                      },
                      "idleTimeout": {
                        "type": "integer",
                        "title": "Idle Timeout (seconds)",
                        "default": 300
                      }
                    }
                  },
                  "replication": {
                    "type": "object",
                    "title": "Replication Configuration",
                    "properties": {
                      "enabled": {
                        "type": "boolean",
                        "title": "Enable Replication",
                        "default": false
                      },
                      "replicas": {
                        "type": "array",
                        "title": "Replica Servers",
                        "items": {
                          "type": "object",
                          "properties": {
                            "host": {
                              "type": "string",
                              "title": "Replica Host"
                            },
                            "port": {
                              "type": "integer",
                              "title": "Replica Port"
                            },
                            "priority": {
                              "type": "integer",
                              "title": "Priority",
                              "minimum": 0,
                              "maximum": 100
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              "webServerConfig": {
                "type": "object",
                "title": "Web Server Configuration",
                "properties": {
                  "serverType": {
                    "type": "string",
                    "title": "Web Server Type",
                    "enum": ["nginx", "apache", "lighttpd", "caddy"],
                    "default": "nginx"
                  },
                  "listenPort": {
                    "type": "integer",
                    "title": "Listen Port",
                    "default": 80
                  },
                  "sslPort": {
                    "type": "integer",
                    "title": "SSL Port",
                    "default": 443
                  },
                  "sslConfig": {
                    "type": "object",
                    "title": "SSL Configuration",
                    "properties": {
                      "enabled": {
                        "type": "boolean",
                        "title": "Enable SSL",
                        "default": true
                      },
                      "certificatePath": {
                        "type": "string",
                        "title": "Certificate Path"
                      },
                      "privateKeyPath": {
                        "type": "string",
                        "title": "Private Key Path"
                      },
                      "protocol": {
                        "type": "string",
                        "title": "SSL Protocol",
                        "enum": ["TLSv1.2", "TLSv1.3"],
                        "default": "TLSv1.3"
                      },
                      "cipherSuite": {
                        "type": "string",
                        "title": "Cipher Suite"
                      }
                    }
                  },
                  "virtualHosts": {
                    "type": "array",
                    "title": "Virtual Hosts",
                    "items": {
                      "type": "object",
                      "properties": {
                        "serverName": {
                          "type": "string",
                          "title": "Server Name"
                        },
                        "documentRoot": {
                          "type": "string",
                          "title": "Document Root"
                        },
                        "aliases": {
                          "type": "array",
                          "title": "Server Aliases",
                          "items": {
                            "type": "string"
                          }
                        },
                        "proxyPass": {
                          "type": "string",
                          "title": "Proxy Pass URL"
                        }
                      }
                    }
                  },
                  "performance": {
                    "type": "object",
                    "title": "Performance Settings",
                    "properties": {
                      "workerProcesses": {
                        "type": "integer",
                        "title": "Worker Processes",
                        "default": 4
                      },
                      "workerConnections": {
                        "type": "integer",
                        "title": "Worker Connections",
                        "default": 1024
                      },
                      "keepaliveTimeout": {
                        "type": "integer",
                        "title": "Keepalive Timeout (seconds)",
                        "default": 65
                      },
                      "gzipCompression": {
                        "type": "boolean",
                        "title": "Enable Gzip Compression",
                        "default": true
                      }
                    }
                  }
                }
              },
              "containerization": {
                "type": "object",
                "title": "Container & Orchestration",
                "properties": {
                  "dockerEnabled": {
                    "type": "boolean",
                    "title": "Enable Docker",
                    "default": false
                  },
                  "dockerVersion": {
                    "type": "string",
                    "title": "Docker Version"
                  },
                  "registries": {
                    "type": "array",
                    "title": "Container Registries",
                    "items": {
                      "type": "object",
                      "properties": {
                        "url": {
                          "type": "string",
                          "title": "Registry URL"
                        },
                        "username": {
                          "type": "string",
                          "title": "Username"
                        },
                        "password": {
                          "type": "string",
                          "title": "Password"
                        }
                      }
                    }
                  },
                  "kubernetesConfig": {
                    "type": "object",
                    "title": "Kubernetes Configuration",
                    "properties": {
                      "enabled": {
                        "type": "boolean",
                        "title": "Enable Kubernetes",
                        "default": false
                      },
                      "clusterName": {
                        "type": "string",
                        "title": "Cluster Name"
                      },
                      "namespace": {
                        "type": "string",
                        "title": "Default Namespace",
                        "default": "default"
                      },
                      "apiServer": {
                        "type": "string",
                        "title": "API Server URL"
                      },
                      "resourceLimits": {
                        "type": "object",
                        "title": "Resource Limits",
                        "properties": {
                          "cpuLimit": {
                            "type": "string",
                            "title": "CPU Limit"
                          },
                          "memoryLimit": {
                            "type": "string",
                            "title": "Memory Limit"
                          }
                        }
                      }
                    }
                  }
                }
              },
              "logging": {
                "type": "object",
                "title": "Logging Configuration",
                "properties": {
                  "centralizedLogging": {
                    "type": "boolean",
                    "title": "Enable Centralized Logging",
                    "default": true
                  },
                  "logLevel": {
                    "type": "string",
                    "title": "Default Log Level",
                    "enum": ["trace", "debug", "info", "warning", "error", "fatal"],
                    "default": "info"
                  },
                  "logFormat": {
                    "type": "string",
                    "title": "Log Format",
                    "enum": ["json", "text", "syslog"],
                    "default": "json"
                  },
                  "logDestinations": {
                    "type": "array",
                    "title": "Log Destinations",
                    "items": {
                      "type": "object",
                      "properties": {
                        "type": {
                          "type": "string",
                          "title": "Destination Type",
                          "enum": ["file", "syslog", "elasticsearch", "splunk", "cloudwatch"]
                        },
                        "endpoint": {
                          "type": "string",
                          "title": "Endpoint/Path"
                        },
                        "credentials": {
                          "type": "object",
                          "properties": {
                            "username": {
                              "type": "string",
                              "title": "Username"
                            },
                            "password": {
                              "type": "string",
                              "title": "Password"
                            }
                          }
                        }
                      }
                    }
                  },
                  "retention": {
                    "type": "object",
                    "title": "Log Retention",
                    "properties": {
                      "days": {
                        "type": "integer",
                        "title": "Retention Period (days)",
                        "default": 30
                      },
                      "maxSize": {
                        "type": "string",
                        "title": "Max Size per Log File",
                        "default": "100MB"
                      },
                      "compression": {
                        "type": "boolean",
                        "title": "Enable Compression",
                        "default": true
                      }
                    }
                  }
                }
              },
              "complianceAndAudit": {
                "type": "object",
                "title": "Compliance & Audit",
                "properties": {
                  "auditingEnabled": {
                    "type": "boolean",
                    "title": "Enable Auditing",
                    "default": true
                  },
                  "complianceStandards": {
                    "type": "array",
                    "title": "Compliance Standards",
                    "items": {
                      "type": "string",
                      "enum": ["PCI-DSS", "HIPAA", "SOC2", "ISO27001", "GDPR"]
                    }
                  },
                  "auditLog": {
                    "type": "object",
                    "title": "Audit Log Configuration",
                    "properties": {
                      "logAllAccess": {
                        "type": "boolean",
                        "title": "Log All Access",
                        "default": true
                      },
                      "logFailedAttempts": {
                        "type": "boolean",
                        "title": "Log Failed Attempts",
                        "default": true
                      },
                      "logConfigChanges": {
                        "type": "boolean",
                        "title": "Log Configuration Changes",
                        "default": true
                      },
                      "retentionYears": {
                        "type": "integer",
                        "title": "Retention Period (years)",
                        "default": 7
                      }
                    }
                  },
                  "dataProtection": {
                    "type": "object",
                    "title": "Data Protection",
                    "properties": {
                      "encryptionAtRest": {
                        "type": "boolean",
                        "title": "Encrypt Data at Rest",
                        "default": true
                      },
                      "encryptionInTransit": {
                        "type": "boolean",
                        "title": "Encrypt Data in Transit",
                        "default": true
                      },
                      "dataClassification": {
                        "type": "string",
                        "title": "Data Classification Level",
                        "enum": ["public", "internal", "confidential", "restricted"]
                      }
                    }
                  }
                }
              },
              "disasterRecovery": {
                "type": "object",
                "title": "Disaster Recovery",
                "properties": {
                  "drPlanEnabled": {
                    "type": "boolean",
                    "title": "Enable DR Plan",
                    "default": false
                  },
                  "rto": {
                    "type": "integer",
                    "title": "Recovery Time Objective (hours)",
                    "description": "Maximum acceptable time to restore service"
                  },
                  "rpo": {
                    "type": "integer",
                    "title": "Recovery Point Objective (hours)",
                    "description": "Maximum acceptable data loss"
                  },
                  "secondarySite": {
                    "type": "object",
                    "title": "Secondary Site Configuration",
                    "properties": {
                      "location": {
                        "type": "string",
                        "title": "Geographic Location"
                      },
                      "ipAddress": {
                        "type": "string",
                        "title": "IP Address"
                      },
                      "syncType": {
                        "type": "string",
                        "title": "Synchronization Type",
                        "enum": ["synchronous", "asynchronous", "semi-synchronous"]
                      },
                      "syncInterval": {
                        "type": "integer",
                        "title": "Sync Interval (minutes)"
                      }
                    }
                  },
                  "failoverConfig": {
                    "type": "object",
                    "title": "Failover Configuration",
                    "properties": {
                      "automatic": {
                        "type": "boolean",
                        "title": "Automatic Failover",
                        "default": false
                      },
                      "healthCheckInterval": {
                        "type": "integer",
                        "title": "Health Check Interval (seconds)",
                        "default": 30
                      },
                      "failureThreshold": {
                        "type": "integer",
                        "title": "Failure Threshold",
                        "default": 3
                      }
                    }
                  }
                }
              },
              "performanceOptimization": {
                "type": "object",
                "title": "Performance Optimization",
                "properties": {
                  "caching": {
                    "type": "object",
                    "title": "Caching Strategy",
                    "properties": {
                      "enabled": {
                        "type": "boolean",
                        "title": "Enable Caching",
                        "default": true
                      },
                      "backend": {
                        "type": "string",
                        "title": "Cache Backend",
                        "enum": ["redis", "memcached", "varnish", "nginx"]
                      },
                      "ttl": {
                        "type": "integer",
                        "title": "Default TTL (seconds)",
                        "default": 3600
                      },
                      "maxMemory": {
                        "type": "string",
                        "title": "Max Memory",
                        "default": "2GB"
                      }
                    }
                  },
                  "loadBalancing": {
                    "type": "object",
                    "title": "Load Balancing",
                    "properties": {
                      "enabled": {
                        "type": "boolean",
                        "title": "Enable Load Balancing",
                        "default": false
                      },
                      "algorithm": {
                        "type": "string",
                        "title": "Algorithm",
                        "enum": ["round-robin", "least-connections", "ip-hash", "weighted"]
                      },
                      "backends": {
                        "type": "array",
                        "title": "Backend Servers",
                        "items": {
                          "type": "object",
                          "properties": {
                            "host": {
                              "type": "string",
                              "title": "Host"
                            },
                            "port": {
                              "type": "integer",
                              "title": "Port"
                            },
                            "weight": {
                              "type": "integer",
                              "title": "Weight",
                              "default": 1
                            }
                          }
                        }
                      }
                    }
                  },
                  "cdn": {
                    "type": "object",
                    "title": "CDN Configuration",
                    "properties": {
                      "enabled": {
                        "type": "boolean",
                        "title": "Enable CDN",
                        "default": false
                      },
                      "provider": {
                        "type": "string",
                        "title": "CDN Provider",
                        "enum": ["cloudflare", "akamai", "cloudfront", "fastly"]
                      },
                      "customDomain": {
                        "type": "string",
                        "title": "Custom Domain"
                      }
                    }
                  }
                }
              },
              "notes": {
                "type": "string",
                "title": "Additional Notes",
                "description": "Any additional information about this server"
              }
            }
          }
        }
      }
    }
  },
  "ui_schema": {
    "kwargs": {
      "ui:title": "",
      "pillar": {
        "ui:title": "",
        "ui:order": ["serverName", "environment", "networkConfig", "hardwareSpecs", "services", "securitySettings", "monitoring", "backupSettings", "databaseConfig", "webServerConfig", "containerization", "logging", "complianceAndAudit", "disasterRecovery", "performanceOptimization", "customSettings", "notes"],
        "environment": {
          "ui:widget": "select"
        },
        "notes": {
          "ui:widget": "textarea",
          "ui:options": { "rows": 4 }
        }
      }
    }
  }
}
end_schema#}

{% set serverName = pillar.serverName %}
{% set env = pillar.environment %}

# Server: {{ serverName }} ({{ env }})

Configure server settings:
  - IP: {{ pillar.networkConfig.ipAddress }}
  - CPU Cores: {{ pillar.hardwareSpecs.cpu.cores }}
  - Memory: {{ pillar.hardwareSpecs.memory.sizeGB }}GB
`;
