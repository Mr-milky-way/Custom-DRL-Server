# Tournaments

## Endpoints
| URL | Type | Info |
|---|---|---|
| /tournaments/ | GET | [Info](#tournaments-get) |
| /player/tournaments/ | GET | [Info]() |
| /tournaments/:guid | GET | [Info]() |
| /tournaments/:guid/matches/:mid | GET | [Info]() |
| /tournaments/:guid/matches/:mid/heat/:hid | GET | [Info]() |
| /tournaments/:guid/matches/:mid/:hid | POST | [Info]() |
| /tournaments/:guid/matches/:mid/countdown | GET | [Info]() |
| /tournaments/:guid/placements | GET | [Info]() |
| /tournaments/:guid/register | GET | [Info]() |
| /tournaments/:guid/unregister | GET | [Info]() |
| /tournaments/:guid/subscribe | GET | [Info]() |
| /tournaments/subscribe | GET | [Info]() |
| /tournaments/:guid/unsubscribe | GET | [Info]() |
| /tournaments/unsubscribe | GET | [Info]() |
| /tournaments/:guid/subscription | GET | [Info]() |
| /tournaments/subscription | GET | [Info]() |
| /tournaments/:guid/scores | POST | [Info]() |
| /tournaments/:guid/results/:rid/ | GET | [Info]() |


### /tournaments/ (GET)
Function: [GetTournaments](#gettournaments)

Wants back: [DRLTournamentResult](/docs/GameDataTypes.md#drltournamentresult)






## Functions

### GetTournaments
```cs
public WebAsyncRequest GetTournaments(DRLTournamentData p_query, bool p_registered_only, Action<DRLTournamentResult> p_callback, int p_timeout = -1, int p_count = 4)
{
	string text = p_registered_only ? "/player/tournaments/" : "/tournaments/";
	string guid = p_query.guid;
	p_query.Remove("guid");
	if (!string.IsNullOrEmpty(guid))
	{
		text = text + guid + "/";
	}
	p_query["limit"] = p_count;
	p_query["token"] = this.token;
	return this.Get("drl.service.tournaments.read", text, delegate(DRLServiceResult p_result)
	{
		DRLTournamentResult res = new DRLTournamentResult();
		if (!p_result.success)
		{
			if (p_callback != null)
			{
				p_callback(res);
			}
			return;
		}
		if (this.m_thread != null)
		{
			this.m_thread.Abort();
		}
		this.m_thread = new Thread(delegate()
		{
			res.tournaments = Serialize.FromJson<DRLTournamentData[]>(p_result.data.ToString(), null, false);
			for (int i = 0; i < res.tournaments.Length; i++)
			{
				res.tournaments[i].WarmUp();
			}
			this.TimerRunOnce(delegate
			{
				if (p_callback != null)
				{
					p_callback(res);
				}
			}, 0.016666668f);
		});
    	this.m_thread.Start();
	}, p_query, p_timeout);
}
```