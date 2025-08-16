Okay, I am thinking about restructuring the local and cloud storage... it │
│ seems to be a mess right now and inefficient. I want to switch to expo │
│ sql lite (https://docs.expo.dev/versions/latest/sdk/sqlite/), and I want │
│ to switch to Auto-Sync on Events with the following idea: │
│ Auto-Sync on Events │
│ │
│ Flow: │
│ │
│ Local changes applied instantly. │
│ │
│ Sync happens automatically when: │
│ │
│ App launches │
│ │
│ App resumes from background │
│ │
│ Network reconnects │
│ │
│ On each sync: only changed data since lastSyncedAt is sent/received. │
│ │
│ Pros: Always feels up-to-date; user doesn’t think about sync. │
│ │
│ Cons: Slightly higher egress, but manageable if using delta sync (see │
│ below). │
│ │
│ gress-Minimization Strategies │
│ │
│ Since egress costs money whenever you pull from the cloud, the idea is to │
│ download only what’s new, and only when you need it. │
│ │
│ A. Delta Sync │
│ │
│ Instead of pulling everything: │
│ │
│ Keep lastSyncedAt in local storage. │
│ │
│ When syncing, request only records updated after lastSyncedAt. │
│ │
│ SELECT \* FROM projects WHERE updated_at > :last_synced │
│ │
│ │
│ Server sends only changed rows → minimal egress. │
│ │
│ Always sync metadata first (small JSON payload). │
│ │
│ Download image only if hash/URL changed. │
│ │
│ │
│ It also may be useful to use React Native Fast Image: │
│ https://github.com/DylanVann/react-native-fast-image
