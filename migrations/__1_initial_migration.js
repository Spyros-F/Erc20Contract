const Migrations = artifacts.require("MYERC20");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
