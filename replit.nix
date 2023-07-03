{ pkgs }: {
  deps = [
    pkgs.mastodon
    pkgs.sudo
    pkgs.python39Packages.pip
    pkgs.nodejs-16_x
    pkgs.nodePackages.vscode-langservers-extracted
    pkgs.nodePackages.typescript-language-server  
  ];
}