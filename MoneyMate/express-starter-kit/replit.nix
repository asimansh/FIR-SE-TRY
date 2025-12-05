# Replit Nix Configuration
# This file specifies the packages and environment for your Replit project

{ pkgs }: {
  deps = [
    # Node.js runtime
    pkgs.nodejs_20
    
    # Package managers
    pkgs.nodePackages.npm
    
    # Development tools
    pkgs.nodePackages.nodemon
    pkgs.nodePackages.typescript-language-server
    
    # Git (usually included by default)
    pkgs.git
  ];
  
  # Environment variables (optional)
  env = {
    NODE_ENV = "development";
  };
}
