# TM-Flash Cloud Storage Implementation Plan

## Executive Summary

This plan outlines the implementation of persistent cloud storage for TM-Flash user settings and statistics, migrating from localStorage-only to cloud-backed storage with user authentication. Decks remain as static JSON files. The solution will use Firebase (Firestore + Auth) to maintain the app's static nature while enabling cross-device synchronization.

## Current localStorage Analysis

### Data Structure
- **Key**: `tmFlash` with schema_version=3
- **Settings**: mode, selected_deck, theme, showProgress
- **Stats**: Per-deck, per-card, per-mode (LM-hanzi-first/LM-meaning-to-chinese/LM-listening/LM-pronunciation) statistics including:
  - total_correct/incorrect counts
  - last_correct/incorrect timestamps
  - correct/incorrect streak lengths and start times

### Data Volume

#### Detailed Byte Calculations

##### Settings Data Structure
The settings object contains user preferences and app state:
```json
{
  "schema_version": 3,
  "settings": {
    "mode": "LM-hanzi-first",
    "selected_deck": "deck_a",
    "theme": "light",
    "showProgress": true
  }
}
```

**Byte Breakdown:**
- Base JSON structure: ~150 bytes (braces, commas, colons)
- String keys: ~65 bytes ("schema_version", "settings", "mode", "selected_deck", "theme", "showProgress")
- String values: ~28 bytes ("LM-hanzi-first", "deck_a", "light", "true")
- Numeric value: ~1 byte (schema version)
- **Total: ~248 bytes** (including JSON overhead and UTF-8 encoding)

##### Stats Data Structure (Per Card, Per Mode)
Each card maintains separate statistics for each learning mode:
```json
{
  "total_correct": 5,
  "total_incorrect": 2,
  "last_correct_at": 1732000000000,
  "last_incorrect_at": 1731900000000,
  "correct_streak_len": 3,
  "incorrect_streak_len": 0,
  "correct_streak_started_at": 1731950000000,
  "incorrect_streak_started_at": null
}
```

**Byte Breakdown per Mode:**
- JSON structure overhead: ~80 bytes (braces, commas, colons, null values)
- Field keys: ~148 bytes ("total_correct", "total_incorrect", "last_correct_at", etc.)
- Numeric values: ~50 bytes (integers 0-999, timestamps ~13 digits each)
- Null values: ~16 bytes ("null" × 4)
- **Total per direction: ~294 bytes** (minimal usage)

**Scaling with Usage:**
- Low usage (few reviews): ~294 bytes/mode
- Medium usage (10-50 reviews): ~320 bytes/mode (larger numbers)
- High usage (100+ reviews): ~350 bytes/mode (multi-digit counters)
- **Average: ~320 bytes per mode**

##### Per-Card Overhead
- Card ID key in cards object: ~15 bytes (e.g., "card_abc123")
- Mode keys: ~80 bytes ("LM-hanzi-first", "LM-meaning-to-chinese", "LM-listening", "LM-pronunciation")
- **Total per card: ~1315 bytes** (320 × 4 modes + 35 overhead)

##### Deck-Level Scaling
- 100 cards: ~135 KB
- 500 cards: ~675 KB
- 1000 cards: ~1350 KB
- 2000 cards: ~2.7 MB

##### Total Application Storage
- Settings: 248 bytes
- Single deck (1000 cards): ~1350 KB
- All decks (4000 cards): ~5.4 MB
- **Maximum realistic usage: ~10 MB** (including multiple decks with extensive review history)

#### JSON Overhead Considerations
- **Key naming**: Long descriptive keys add ~40% overhead vs. minified keys
- **Data types**: Numbers and booleans are compact; strings and nulls add overhead
- **Nested structure**: Multiple levels of nesting increase structural overhead
- **UTF-8 encoding**: All text uses UTF-8, typically 1 byte per ASCII character
- **Compression**: Firestore may compress data internally, reducing actual storage costs

#### Scaling Estimates
- **Light user**: 100 cards, 6 months usage → ~100 KB total
- **Regular user**: 500 cards, 1 year usage → ~500 KB total
- **Power user**: 2000 cards, 2 years usage → ~3 MB total
- **Growth factor**: Storage increases linearly with cards reviewed, logarithmically with usage time

## Recommended Solution: Firebase + Firestore

### Why Firebase?
- **Free Tier**: 1GB storage, 50K reads/day, 20K writes/day
- **Static App Friendly**: CDN-delivered SDK, no server required
- **Authentication**: Built-in user auth with multiple providers
- **Real-time Sync**: Automatic data synchronization
- **Offline Support**: Built-in offline persistence
- **Security**: Granular access controls via security rules

### Database Choice: Firestore (Document Database)
- **Better Fit**: Hierarchical data (users → decks → cards → stats) maps naturally to document collections
- **Querying**: Supports complex queries for stats analysis
- **Real-time**: Automatic UI updates on data changes
- **Scaling**: Handles growth from prototype to production

## Technical Architecture

### Data Schema Design

#### Firestore Collections Structure
```
 /users/{userId}/
   ├── settings (document)
   │   ├── mode: string
   │   ├── selected_deck: string
   │   ├── theme: string
   │   ├── showProgress: boolean
   │   └── last_sync: timestamp
   │
   └── decks/{deckId}/
       └── cards/{cardId}/
           ├── LM-hanzi-first (document)
           │   ├── total_correct: number
           │   ├── total_incorrect: number
           │   ├── last_correct_at: timestamp
           │   ├── last_incorrect_at: timestamp
           │   ├── correct_streak_len: number
           │   ├── incorrect_streak_len: number
           │   ├── correct_streak_started_at: timestamp
           │   └── incorrect_streak_started_at: timestamp
           │
           ├── LM-meaning-to-chinese (document)
           │   ├── [same structure as LM-hanzi-first]
           │
           ├── LM-listening (document)
           │   ├── [same structure as LM-hanzi-first]
           │
           └── LM-pronunciation (document)
               ├── [same structure as LM-hanzi-first]
```

### Authentication Strategy

#### User Auth Flow
1. **Anonymous Users**: Allow guest access with device-based persistence
2. **Registered Users**: Email/password or OAuth (Google, etc.)
3. **Account Linking**: Allow anonymous users to upgrade to registered accounts
4. **Multi-device Sync**: Automatic sync across user's devices

#### Auth Integration Points
- Login/logout buttons in settings modal
- Auth state persistence across sessions
- Graceful handling of auth errors
- User data isolation via Firebase security rules

### Sync Strategy

#### Online-First with Offline Fallback
- **Primary**: Cloud as source of truth
- **Offline**: localStorage as cache with sync queue
- **Conflict Resolution**: Timestamp-based last-write-wins
- **Sync Triggers**: App load, auth state changes, periodic intervals

#### Migration Strategy
1. **First Login**: Detect existing localStorage data
2. **User Consent**: Prompt to migrate local data to cloud
3. **Incremental Migration**: Upload in batches to avoid timeouts
4. **Verification**: Compare local vs cloud data integrity
5. **Cleanup**: Remove localStorage after successful migration

## Implementation Roadmap

### Phase 1: Foundation (1-2 weeks)
1. **Firebase Setup**
   - Create Firebase project
   - Enable Firestore and Authentication
   - Configure security rules
   - Add Firebase SDK to index.html

2. **Auth Module Creation**
   - Create `auth.js` module
   - Implement login/logout UI in modal
   - Handle auth state changes
   - Add user account management

3. **Storage Abstraction**
   - Create `cloudStorage.js` module
   - Abstract localStorage operations
   - Add cloud storage methods
   - Implement dual-write for migration period

### Phase 2: Core Sync (2-3 weeks)
4. **Data Schema Implementation**
   - Design Firestore document structures
   - Create data transformation utilities
   - Implement CRUD operations for all data types

5. **Sync Engine**
   - Implement online/offline detection
   - Create sync queue for offline changes
   - Add conflict resolution logic
   - Implement periodic sync

6. **Migration System**
   - Create migration UI/UX
   - Implement data export/import
   - Add migration progress indicators
   - Handle migration errors gracefully

### Phase 3: Integration & Testing (1-2 weeks)
7. **Module Integration**
   - Update Storage module to use cloud storage
   - Modify Stats module for cloud persistence
   - Update Settings module for cloud sync
   - Ensure backward compatibility

8. **Testing & Validation**
   - Test auth flows (login/logout/signup)
   - Validate data sync across devices
   - Test offline/online transitions
   - Performance testing with large datasets

9. **Production Deployment**
   - Update Firebase security rules
   - Configure production environment
   - Monitor initial usage and errors
   - Plan for scaling

## Security Implementation

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Data Privacy
- **Encryption**: Firebase handles data encryption at rest/transit
- **Access Control**: User-scoped data access
- **GDPR Compliance**: Data portability, right to deletion
- **Audit Trail**: Firebase provides access logs

## Cost Analysis

### Firebase Free Tier Limits
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Auth**: 50K monthly active users
- **Hosting**: 10GB/month, 360MB/day

### Estimated Usage for TM-Flash
- **Light User**: 100 cards, daily review → ~10 writes/day
- **Heavy User**: 1000+ cards, multiple sessions → ~100 writes/day
- **Scaling**: Free tier supports 100-500 active users

### Cost Projections
- **Free Tier**: 0$ for development and small user base
- **Growth**: $0.06/GB storage, $0.18/100K reads, etc.
- **Break-even**: ~10K active users before paid tier needed

## Risk Assessment & Mitigation

### High-Risk Areas
1. **Data Migration**: Potential data loss during migration
   - *Mitigation*: Comprehensive backups, staged rollout, rollback plan

2. **Auth Integration**: Breaking existing user experience
   - *Mitigation*: Optional auth, maintain localStorage fallback

3. **Performance Impact**: Firebase SDK bundle size (~200KB)
   - *Mitigation*: Lazy loading, code splitting if needed

4. **Offline Functionality**: Complex offline/online sync
   - *Mitigation*: Thorough testing, fallback to localStorage

### Success Metrics
- **Data Persistence**: 99.9% uptime for user data
- **Sync Reliability**: <5% sync conflicts requiring manual resolution
- **Performance**: <500ms sync latency, <2s app load time
- **User Adoption**: >80% users opt into cloud storage

## Development Workflow

### Testing Strategy
- **Unit Tests**: Manual testing of individual functions
- **Integration Tests**: End-to-end sync testing
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Offline Testing**: Network throttling, airplane mode

### Deployment Process
1. **Development**: Use Firebase emulator for local testing
2. **Staging**: Deploy to Firebase hosting staging channel
3. **Production**: Gradual rollout with feature flags
4. **Monitoring**: Firebase console for usage analytics

## Next Steps

1. **Approval**: Review and approve this implementation plan
2. **Firebase Setup**: Create Firebase project and configure services
3. **SDK Integration**: Add Firebase SDK and basic auth UI
4. **Prototype**: Build minimal viable cloud storage prototype
5. **Testing**: Validate sync and auth functionality
6. **Full Implementation**: Complete integration across all modules

---

*This plan provides a comprehensive roadmap for cloud storage implementation while maintaining TM-Flash's simplicity and performance characteristics.*