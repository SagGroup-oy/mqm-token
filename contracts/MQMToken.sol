// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title MQM Token - SAG Group Oy
/// @author SAG Group Oy (tech@sag-group.io)
/// @notice ERC-20 utility token for the SAG Group agricultural ecosystem
/// @dev Deployed on Polygon. MiCA compliant (EU). Pausable for emergency stop.
/// Token powers: Farm wages, smallholder advances, ICO rounds, MQM utility
/// Total supply: 10,000,000,900 MQM (fixed)
contract MQMToken is ERC20, ERC20Burnable, Ownable, ERC20Permit, Pausable {

    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10 ** 18;

    uint256 public constant ICO_BPS       = 3350;
    uint256 public constant TEAM_BPS      = 2500;
    uint256 public constant ECOSYSTEM_BPS = 1500;
    uint256 public constant LIQUIDITY_BPS = 1000;
    uint256 public constant RESERVE_BPS   =  650;
    uint256 public constant ADVISOR_BPS   = 1000;

    address public immutable icoWallet;
    address public immutable teamWallet;
    address public immutable ecosystemWallet;
    address public immutable liquidityWallet;
    address public immutable reserveWallet;
    address public immutable advisorWallet;

    uint256 public constant SEED_PRICE_CENTS = 50;
    uint256 public constant K1_PRICE_CENTS   = 100;
    uint256 public constant K2_PRICE_CENTS   = 200;
    uint256 public constant K3_PRICE_CENTS   = 300;

    event TokensAllocated(address indexed wallet, uint256 amount, string allocation);

    constructor(
        address _icoWallet,
        address _teamWallet,
        address _ecosystemWallet,
        address _liquidityWallet,
        address _reserveWallet,
        address _advisorWallet,
        address initialOwner
    )
        ERC20("MQM Token", "MQM")
        Ownable(initialOwner)
        ERC20Permit("MQM Token")
    {
        require(_icoWallet       != address(0), "ICO wallet is zero address");
        require(_teamWallet      != address(0), "Team wallet is zero address");
        require(_ecosystemWallet != address(0), "Ecosystem wallet is zero address");
        require(_liquidityWallet != address(0), "Liquidity wallet is zero address");
        require(_reserveWallet   != address(0), "Reserve wallet is zero address");
        require(_advisorWallet   != address(0), "Advisor wallet is zero address");
        icoWallet       = _icoWallet;
        teamWallet      = _teamWallet;
        ecosystemWallet = _ecosystemWallet;
        liquidityWallet = _liquidityWallet;
        reserveWallet   = _reserveWallet;
        advisorWallet   = _advisorWallet;
        _mintAllocation(icoWallet,       ICO_BPS,       "ICO Public Sale 33.5%");
        _mintAllocation(teamWallet,      TEAM_BPS,      "Team & Founders 25%");
        _mintAllocation(ecosystemWallet, ECOSYSTEM_BPS, "Ecosystem Fund 15%");
        _mintAllocation(liquidityWallet, LIQUIDITY_BPS, "Liquidity Pool 10%");
        _mintAllocation(reserveWallet,   RESERVE_BPS,   "Strategic Reserve 6.5%");
        _mintAllocation(advisorWallet,   ADVISOR_BPS,   "Advisors 10%");
        require(totalSupply() == MAX_SUPPLY, "Supply mismatch");
    }

    function _mintAllocation(address wallet, uint256 bps, string memory label) internal {
        uint256 amount = (MAX_SUPPLY * bps) / 10_000;
        _mint(wallet, amount);
        emit TokensAllocated(wallet, amount, label);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _update(address from, address to, uint256 value)
        internal override whenNotPaused
    {
        super._update(from, to, value);
    }

    function decimals() public pure override returns (uint8) { return 18; }
}
