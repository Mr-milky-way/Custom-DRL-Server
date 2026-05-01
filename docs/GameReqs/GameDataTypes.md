

# DRLTournamentResult
```cs
public class DRLTournamentResult
{
	public DRLTournamentResult()
	{
		this.tournaments = new DRLTournamentData[0];
	}

	public DRLTournamentData[] tournaments;
}
```

Example Json
```json
{
"success": true,
"data": DRLTournamentData[]
}

```

# DRLTournamentData
```cs
public class DRLTournamentData : SerializedData
{
	public string[] playerIds
	{
		get
		{
			if (this.m_playerIds != null)
			{
				return this.m_playerIds;
			}
			return new string[0];
		}
	}

	public int registeredPlayersCount
	{
		get
		{
			return base.Get<int>("players-size", 0);
		}
	}

	public int maxPlayers
	{
		get
		{
			return base.Get<int>("max-players", 0);
		}
	}

	public string id
	{
		get
		{
			return base.Get<string>("id", "");
		}
	}

	public string guid
	{
		get
		{
			return base.Get<string>("guid", "");
		}
		set
		{
			this.Set("guid", value);
		}
	}

	public string title
	{
		get
		{
			return base.Get<string>("title", "");
		}
	}

	public string region
	{
		get
		{
			return base.Get<string>("region", "");
		}
	}

	public bool enabledLAN
	{
		get
		{
			return base.Get<bool>("lan-support", false);
		}
	}

	public string serverLAN
	{
		get
		{
			return base.Get<string>("server-ip", "");
		}
	}

	public string callToAction
	{
		get
		{
			return base.Get<string>("call-to-action", "");
		}
	}

	public string description
	{
		get
		{
			return base.Get<string>("description", "");
		}
	}

	public string prizeDescription
	{
		get
		{
			return base.Get<string>("prize-description", string.Empty);
		}
	}

	public string prizeURL
	{
		get
		{
			return base.Get<string>("prize-url", "");
		}
	}

	public string imageURL
	{
		get
		{
			return base.Get<string>("image-url", "");
		}
	}

	public string videoURL
	{
		get
		{
			return base.Get<string>("video-url");
		}
	}

	public bool allowRegistrations
	{
		get
		{
			return base.Get<bool>("allow-new-registration", false);
		}
	}

	public bool disablePublicSpectators
	{
		get
		{
			return base.Get<bool>("disable-public-spectators", false);
		}
	}

	public string registerStartDateString
	{
		get
		{
			object obj = base.Get<object>("register-start", null);
			if (obj != null)
			{
				return obj.ToString();
			}
			return "";
		}
	}

	public string registerEndDateString
	{
		get
		{
			object obj = base.Get<object>("register-end", null);
			if (obj != null)
			{
				return obj.ToString();
			}
			return "";
		}
	}

	public string currentTimeString
	{
		get
		{
			object obj = base.Get<object>("current-time", null);
			if (obj != null)
			{
				return obj.ToString();
			}
			return "";
		}
	}

	public bool hasPenalty
	{
		get
		{
			return base.Get<bool>("penalty", false);
		}
	}

	public DateTime registerStartDate
	{
		get
		{
			string registerStartDateString = this.registerStartDateString;
			DateTime minValue = DateTime.MinValue;
			DateTime.TryParse(registerStartDateString, out minValue);
			return minValue;
		}
	}

	public DateTime registerEndDate
	{
		get
		{
			string registerEndDateString = this.registerEndDateString;
			DateTime minValue = DateTime.MinValue;
			DateTime.TryParse(registerEndDateString, out minValue);
			return minValue;
		}
	}

	public DateTime currentTime
	{
		get
		{
			string currentTimeString = this.currentTimeString;
			DateTime minValue = DateTime.MinValue;
			DateTime.TryParse(currentTimeString, out minValue);
			return minValue;
		}
	}

	public TournamentState status
	{
		get
		{
			object obj = base.Get<object>("status", null);
			if (obj == null)
			{
				return TournamentState.none;
			}
			return (TournamentState)Enum.Parse(typeof(TournamentState), obj.ToString());
		}
	}

	public TournamentProgression progression
	{
		get
		{
			object obj = base.Get<object>("progression", null);
			if (obj == null)
			{
				return TournamentProgression.auto;
			}
			return (TournamentProgression)Enum.Parse(typeof(TournamentProgression), obj.ToString());
		}
	}

	public bool invalid
	{
		get
		{
			TournamentState status = this.status;
			return status - TournamentState.fail <= 1 || status == TournamentState.canceled;
		}
	}

	public string droneGuid
	{
		get
		{
			if (this.drlPilotMode)
			{
				return "DRD-fc5bf84d13e5bac67957921c";
			}
			return base.Get<string>("drone-guid", "");
		}
	}

	public int droneClass
	{
		get
		{
			if (this.drlPilotMode)
			{
				return 1;
			}
			int result = -1;
			int.TryParse(this.droneClassString, out result);
			return result;
		}
	}

	public bool drlPilotMode
	{
		get
		{
			return base.Get<bool>("drl-pilot-mode", false);
		}
	}

	public string droneClassString
	{
		get
		{
			return base.Get<object>("default-drone-class", "0").ToString();
		}
	}

	public int minimumSkill
	{
		get
		{
			return base.Get<int>("minimum-skill", 0);
		}
		set
		{
			this.Set("minimum-skill", value);
		}
	}

	public string streamingURL
	{
		get
		{
			return base.Get<string>("streaming-url", "");
		}
	}

	public bool isPrivate
	{
		get
		{
			return base.Get<bool>("private", false);
		}
	}

	public bool isDAWC
	{
		get
		{
			return base.Get<bool>("dawc-seeding", false);
		}
	}

	public bool hasCountdown
	{
		get
		{
			return base.Get<bool>("countdown", false);
		}
	}

	public DRLTournamentRoundData[] rounds
	{
		get
		{
			if (this.m_rounds != null)
			{
				return this.m_rounds;
			}
			return new DRLTournamentRoundData[0];
		}
	}

	public int GetActiveRoundIndex()
	{
		DRLTournamentRoundData[] rounds = this.rounds;
		if (rounds == null)
		{
			return -1;
		}
		for (int i = 0; i < rounds.Length; i++)
		{
			if (rounds[i] != null && rounds[i].state == TournamentRoundState.active)
			{
				return i;
			}
		}
		if (this.status == TournamentState.complete)
		{
			return this.rounds.Length - 1;
		}
		return -1;
	}

	public DRLTournamentRoundData GetActiveRound()
	{
		int activeRoundIndex = this.GetActiveRoundIndex();
		if (activeRoundIndex >= 0)
		{
			return this.rounds[activeRoundIndex];
		}
		return null;
	}

	public DRLTournamentRoundData GetLastRound()
	{
		DRLTournamentRoundData result = null;
		if (this.rounds == null || this.rounds.Length == 0)
		{
			return result;
		}
		for (int i = 0; i < this.rounds.Length; i++)
		{
			if (this.rounds[i].state == TournamentRoundState.complete)
			{
				result = this.rounds[i];
			}
		}
		return result;
	}

	public TournamentRoundGameMode GetActiveRoundMode()
	{
		DRLTournamentRoundData activeRound = this.GetActiveRound();
		if (activeRound != null)
		{
			return activeRound.gameMode;
		}
		return TournamentRoundGameMode.none;
	}

	public TournamentRoundState GetActiveRoundState()
	{
		DRLTournamentRoundData activeRound = this.GetActiveRound();
		if (activeRound != null)
		{
			return activeRound.state;
		}
		return TournamentRoundState.none;
	}

	public DRLTournamentRoundData GetRoundForMatch(string p_matchId)
	{
		for (int i = 0; i < this.rounds.Length; i++)
		{
			if (this.rounds[i].matches != null && this.rounds[i].matches.Length != 0)
			{
				for (int j = 0; j < this.rounds[i].matches.Length; j++)
				{
					if (this.rounds[i].matches[j].Id == p_matchId)
					{
						return this.rounds[i];
					}
				}
			}
		}
		return null;
	}

	public DRLTournamentPlayerData[] rankings
	{
		get
		{
			if (this.m_rankings != null)
			{
				return this.m_rankings;
			}
			return new DRLTournamentPlayerData[0];
		}
	}

	public bool ageRestricted
	{
		get
		{
			return base.Get<bool>("age-check");
		}
	}

	public int ageRestriction
	{
		get
		{
			return base.Get<int>("age-check-number");
		}
	}

	public string termsURL
	{
		get
		{
			return base.Get<string>("terms-and-conditions-url");
		}
	}

	public TournamentType type
	{
		get
		{
			return (TournamentType)Enum.Parse(typeof(TournamentType), base.Get<string>("type", "None"));
		}
	}

	public void WarmUp()
	{
		JArray jarray = (JArray)base.Get<object>("player-ids", null);
		this.m_playerIds = ((jarray == null) ? new string[0] : jarray.ToObject<string[]>());
		jarray = (JArray)base.Get<object>("ranking", null);
		this.m_rankings = ((jarray == null) ? new DRLTournamentPlayerData[0] : jarray.ToObject<DRLTournamentPlayerData[]>());
		for (int i = 0; i < this.m_rankings.Length; i++)
		{
			this.m_rankings[i].WarmUp();
		}
		jarray = (JArray)base.Get<object>("rounds", null);
		this.m_rounds = ((jarray == null) ? new DRLTournamentRoundData[0] : jarray.ToObject<DRLTournamentRoundData[]>());
		for (int j = 0; j < this.m_rounds.Length; j++)
		{
			this.m_rounds[j].WarmUp();
		}
	}

	public bool IsPlayerRegistered(string p_player_id)
	{
		if (string.IsNullOrEmpty(p_player_id))
		{
			return false;
		}
		if (this.playerIds == null)
		{
			return false;
		}
		for (int i = 0; i < this.playerIds.Length; i++)
		{
			if (this.playerIds[i] == p_player_id)
			{
				return true;
			}
		}
		return false;
	}

	public bool IsRacingInMatch(string p_steamID, string p_matchID)
	{
		DRLTournamentRoundData activeRound = this.GetActiveRound();
		if (activeRound == null)
		{
			return false;
		}
		for (int i = 0; i < activeRound.matches.Length; i++)
		{
			if (activeRound.matches[i].Id == p_matchID)
			{
				for (int j = 0; j < activeRound.matches[i].playerIds.Length; j++)
				{
					if (activeRound.matches[i].playerIds[j] == p_steamID)
					{
						return true;
					}
				}
			}
		}
		return false;
	}

	private string[] m_playerIds;

	private DRLTournamentRoundData[] m_rounds;

	private DRLTournamentPlayerData[] m_rankings;
}
```