
// Ensure DOM is loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Toggle for advanced settings
    document.getElementById('toggleAdvanced').addEventListener('click', function() {
        const container = document.querySelector('.advanced-settings-container');
        const toggleIcon = this.querySelector('.toggle-icon');
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            container.classList.add('visible');
            toggleIcon.classList.add('rotated');
        } else {
            container.style.display = 'none';
            container.classList.remove('visible');
            toggleIcon.classList.remove('rotated');
        }
    });
});

// Tab functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Webhook visibility toggle
document.getElementById('WebhooksEnabled').addEventListener('change', function() {
    const webhookGrid = document.querySelector('.webhook-grid');
    webhookGrid.classList.toggle('hidden', !this.checked);
});

// File upload and auto-fill logic for Game.ini configuration
document.getElementById('configFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const fileContent = e.target.result;
        const parsedData = parseIni(fileContent); 
        autofillForm(parsedData);
    };

    reader.readAsText(file);
});

/**
 * Basic INI parser that converts file content into an object.
 * This function will only parse known sections and fields that are part of the HTML form.
 * @param {string} iniContent - The content of the uploaded INI file.
 * @return {Object} Parsed content as a key-value dictionary.
 */
function parseIni(iniContent) {
    const lines = iniContent.split(/\r?\n/);
    const data = {};
    let currentSection = '';

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith(';') || line.startsWith('#')) continue; // Ignore comments and empty lines

        // Section header
        if (line.startsWith('[') && line.endsWith(']')) {
            currentSection = line.slice(1, -1);
            data[currentSection] = {};
        } else if (currentSection && line.includes('=')) {
            const [key, value] = line.split('=');
            data[currentSection][key.trim()] = value ? value.trim() : '';
        }
    }

    return data;
}

/**
 * Autofill form fields based on parsed data from the INI file.
 * This function will ignore fields that don't map to form elements.
 * @param {Object} data - Parsed data from the INI file.
 */
function autofillForm(data) {
    /**
     * A utility function that handles form autofill for both text inputs and checkboxes.
     * Handles input differences for strings and booleans (uses checked state).
     * @param {string} selector - The ID of the form element.
     * @param {string} value - The value to place in the form element.
     */
    const fillField = (selector, value) => {
        const element = document.getElementById(selector);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value === 'true';
            } else {
                element.value = value || '';
            }
        }
    };

    // Fill the [/Script/PathOfTitans.IGameSession] section
    if (data['/Script/PathOfTitans.IGameSession']) {
        const sessionData = data['/Script/PathOfTitans.IGameSession'];

        fillField('ServerName', sessionData.ServerName);
        fillField('MaxPlayers', sessionData.MaxPlayers);
        fillField('ServerMap', sessionData.ServerMap);
        fillField('ServerDiscord', sessionData.ServerDiscord);
        fillField('RestartLengthInSeconds', sessionData.RestartLengthInSeconds);
        fillField('GlobalPassiveGrowthPerMinute', sessionData.GlobalPassiveGrowthPerMinute);
        
        fillField('bServerGrowth', sessionData.bServerGrowth);
        fillField('bServerEditAbilitiesAtNest', sessionData.bServerEditAbilitiesAtNest);
        fillField('bServerEditAbilitiesInHomeCaves', sessionData.bServerEditAbilitiesInHomeCaves);
        fillField('ServerLogoutTime', sessionData.ServerLogoutTime);
    }

    // Fill the [/Script/PathOfTitans.IGameMode] section
    if (data['/Script/PathOfTitans.IGameMode']) {
        const gameModeData = data['/Script/PathOfTitans.IGameMode'];

        fillField('DefaultCreatorModeSave', gameModeData.DefaultCreatorModeSave);
        fillField('MaxGroupSize', gameModeData.MaxGroupSize);
        fillField('MaxGroupLeaderCommunicationDistance', gameModeData.MaxGroupLeaderCommunicationDistance);
    }

    // Fill the [SourceRCON] section
    if (data['SourceRCON']) {
        const rconData = data['SourceRCON'];

        fillField('RCONEnabled', rconData.bEnabled);
        fillField('RCONLogging', rconData.bLogging);
        fillField('RCONPassword', rconData.Password);
    }

    // Fill the [ServerWebhooks] section
    if (data['ServerWebhooks']) {
        const webhookData = data['ServerWebhooks'];

        fillField('WebhooksEnabled', webhookData.bEnabled);
        fillField('PlayerReport', webhookData.PlayerReport);
        fillField('PlayerChat', webhookData.PlayerChat);
        fillField('PlayerLogin', webhookData.PlayerLogin);
        fillField('PlayerLogout', webhookData.PlayerLogout);
        fillField('PlayerLeave', webhookData.PlayerLeave);
        fillField('PlayerKilled', webhookData.PlayerKilled);
        fillField('PlayerQuestComplete', webhookData.PlayerQuestComplete);
        fillField('PlayerQuestFailed', webhookData.PlayerQuestFailed);
        fillField('PlayerRespawn', webhookData.PlayerRespawn);
        fillField('ServerRestart', webhookData.ServerRestart);
        fillField('AdminCommand', webhookData.AdminCommand);
        fillField('ServerModerate', webhookData.ServerModerate);
        fillField('PlayerDamagedPlayer', webhookData.PlayerDamagedPlayer);
    }
}

// Form submission handler
document.getElementById('configForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const config = Object.fromEntries(formData);

    // Generate INI content
    let iniContent = '[/Script/PathOfTitans.IGameSession]\n';

    // Add Server Admins first if any exist
    if (config.ServerAdmins) {
        const admins = config.ServerAdmins.split('\n').filter(admin => admin.trim());
        admins.forEach(admin => {
            if (admin.trim()) {
                iniContent += `ServerAdmins=${admin.trim()}\n`;
            }
        });
    }

    // Helper function to add setting if it exists
    const addSetting = (key, value, transform = (v) => v) => {
        if (value !== undefined && value !== '') {
            iniContent += `${key}=${transform(value)}\n`;
        }
    };

    // Helper function for boolean settings
    const addBoolSetting = (key, value) => {
        if (value !== undefined) {
            iniContent += `${key}=${value ? 'True' : 'False'}\n`;
        }
    };

    // Basic settings
    addSetting('ServerName', config.ServerName);
    addSetting('MaxPlayers', config.MaxPlayers);
    addSetting('ServerMap', config.ServerMap);
    addSetting('ServerDiscord', config.ServerDiscord);
    addBoolSetting('bServerAutoRestart', config.bServerAutoRestart);
    addSetting('RestartLengthInSeconds', config.RestartLengthInSeconds);

    // Growth settings
    addBoolSetting('bServerGrowth', config.bServerGrowth);
    addSetting('GlobalPassiveGrowthPerMinute', config.GlobalPassiveGrowthPerMinute);
    addSetting('ChangeSubspeciesGrowthPenaltyPercent', config.ChangeSubspeciesGrowthPenaltyPercent);

    // Weather settings
    addBoolSetting('bOverrideWeather', config.bOverrideWeather);
    if (config.WeatherLengthVariationX && config.WeatherLengthVariationY) {
        addSetting('WeatherLengthVariation', null, () => 
            `(X=${config.WeatherLengthVariationX},Y=${config.WeatherLengthVariationY})`);
    }
    if (config.WeatherBlendVariationX && config.WeatherBlendVariationY) {
        addSetting('WeatherBlendVariation', null, () => 
            `(X=${config.WeatherBlendVariationX},Y=${config.WeatherBlendVariationY})`);
    }

    // Death settings
    addBoolSetting('bPermaDeath', config.bPermaDeath);
    addBoolSetting('bDeathInfo', config.bDeathInfo);
    addSetting('MinGrowthAfterDeath', config.MinGrowthAfterDeath);
    addSetting('FallDeathMarksPenaltyPercent', config.FallDeathMarksPenaltyPercent);
    addSetting('FallDeathGrowthPenaltyPercent', config.FallDeathGrowthPenaltyPercent);
    addSetting('SurvivalDeathMarksPenaltyPercent', config.SurvivalDeathMarksPenaltyPercent);
    addSetting('SurvivalDeathGrowthPenaltyPercent', config.SurvivalDeathGrowthPenaltyPercent);

    // Homecave settings
    addBoolSetting('bServerHomeCaves', config.bServerHomeCaves);
    addBoolSetting('bServerWellRestedBuff', config.bServerWellRestedBuff);
    addBoolSetting('bServerHatchlingCaves', config.bServerHatchlingCaves);
    addBoolSetting('bServerHungerThirstInCaves', config.bServerHungerThirstInCaves);
    addSetting('HatchlingCaveExitGrowth', config.HatchlingCaveExitGrowth);
    addBoolSetting('bServerHomecaveCampingDebuff', config.bServerHomecaveCampingDebuff);
    addBoolSetting('bOverrideHomecaveCampingDistance', config.bOverrideHomecaveCampingDistance);
    addSetting('HomecaveCampingDistance', config.HomecaveCampingDistance);
    addBoolSetting('bOverrideHomecaveCampingDelay', config.bOverrideHomecaveCampingDelay);
    addSetting('HomecaveCampingDelay', config.HomecaveCampingDelay);

    // Critter settings
    addBoolSetting('bServerCritters', config.bServerCritters);
    addSetting('ServerMaxCritters', config.ServerMaxCritters);

    // Combat settings
    addBoolSetting('bServerCombatTimerAppliesToGroup', config.bServerCombatTimerAppliesToGroup);
    addBoolSetting('bLoseGrowthPastGrowthStages', config.bLoseGrowthPastGrowthStages);
    addSetting('CombatDeathMarksPenaltyPercent', config.CombatDeathMarksPenaltyPercent);
    addSetting('CombatDeathGrowthPenaltyPercent', config.CombatDeathGrowthPenaltyPercent);

    // Quest settings
    addBoolSetting('bOverrideMaxCompleteQuestsInLocation', config.bOverrideMaxCompleteQuestsInLocation);
    addSetting('MaxCompleteQuestsInLocation', config.MaxCompleteQuestsInLocation);
    addSetting('QuestGrowthMultiplier', config.QuestGrowthMultiplier);
    addSetting('QuestMarksMultiplier', config.QuestMarksMultiplier);
    addBoolSetting('bOverrideLocalQuestCooldown', config.bOverrideLocalQuestCooldown);
    addSetting('LocalQuestCooldown', config.LocalQuestCooldown);
    addBoolSetting('bOverrideLocationQuestCooldown', config.bOverrideLocationQuestCooldown);
    addSetting('LocationQuestCooldown', config.LocationQuestCooldown);
    addBoolSetting('bLoseQuestsOnDeath', config.bLoseQuestsOnDeath);
    addBoolSetting('bTrophyQuests', config.bTrophyQuests);
    addBoolSetting('bOverrideTrophyQuestCooldown', config.bOverrideTrophyQuestCooldown);
    addSetting('TrophyQuestCooldown', config.TrophyQuestCooldown);
    addSetting('MaxGroupQuests', config.MaxGroupQuests);
    addBoolSetting('bServerLocalWorldQuests', config.bServerLocalWorldQuests);
    addSetting('ServerMinTimeBetweenExplorationQuest', config.ServerMinTimeBetweenExplorationQuest);

    // Nesting settings
    addBoolSetting('bNesting', config.bNesting);
    addBoolSetting('bNestingDecorations', config.bNestingDecorations);
    addBoolSetting('bSameSpeciesAdoptionRestriction', config.bSameSpeciesAdoptionRestriction);
    addSetting('MinNestingGrowth', config.MinNestingGrowth);
    addSetting('MaxNestImmunityBuffGrowth', config.MaxNestImmunityBuffGrowth);
    addSetting('MaxNestRespawnGrowth', config.MaxNestRespawnGrowth);
    addSetting('MaxNestFreeRespawnGrowth', config.MaxNestFreeRespawnGrowth);
    addSetting('MinNestRespawnCondition', config.MinNestRespawnCondition);
    addSetting('MinNestHealthForDecorations', config.MinNestHealthForDecorations);
    addSetting('MinNestBabySlotFoodWater', config.MinNestBabySlotFoodWater);
    addSetting('MinNestBabySlotResources', config.MinNestBabySlotResources);
    addSetting('MinNestHealthToEditAbilities', config.MinNestHealthToEditAbilities);
    addSetting('MaxAdoptionGrowth', config.MaxAdoptionGrowth);
    addSetting('NestInactiveDespawnTimeSolo', config.NestInactiveDespawnTimeSolo);
    addSetting('NestInactiveDespawnTimeDependents', config.NestInactiveDespawnTimeDependents);
    addSetting('NestDisrepairDespawnTime', config.NestDisrepairDespawnTime);
    addSetting('NestBabySlotGenerationTime', config.NestBabySlotGenerationTime);
    addSetting('NestInvitationExpiryTime', config.NestInvitationExpiryTime);
    addSetting('NestAcceptedInvitationExpiryTime', config.NestAcceptedInvitationExpiryTime);
    addSetting('FamilyBuffRange', config.FamilyBuffRange);
    addSetting('NestResourceMultiplier', config.NestResourceMultiplier);
    addSetting('NestResourcelessConstructionSpeed', config.NestResourcelessConstructionSpeed);
    addBoolSetting('bNestsInvulnerable', config.bNestsInvulnerable);
    addBoolSetting('bSpawnParentNestOnLogin', config.bSpawnParentNestOnLogin);
    addSetting('NestObstructionRadius', config.NestObstructionRadius);
    addBoolSetting('bServerEditAbilitiesAtNest', config.bServerEditAbilitiesAtNest);
    addBoolSetting('bUseTutorialCustomGrowthMultiplier', config.bUseTutorialCustomGrowthMultiplier);
    addSetting('TutorialCustomGrowthMultiplier', config.TutorialCustomGrowthMultiplier);
    addSetting('MaxEatFromNestGrowth', config.MaxEatFromNestGrowth);

    // Game Mode settings
    iniContent += '\n[/Script/PathOfTitans.IGameMode]\n';
    addSetting('DefaultCreatorModeSave', config.DefaultCreatorModeSave);
    addSetting('MaxGroupSize', config.MaxGroupSize);
    addSetting('MaxGroupLeaderCommunicationDistance', config.MaxGroupLeaderCommunicationDistance);
    addSetting('ServerStartingTime', config.ServerStartingTime);
    addSetting('bServerDynamicTimeOfDay', config.bServerDynamicTimeOfDay);
    addBoolSetting('bServerRestrictHerbivoreGrouping', config.bServerRestrictHerbivoreGrouping);
    addBoolSetting('bServerRestrictCarnivoreGrouping', config.bServerRestrictCarnivoreGrouping);
    addSetting('FurthestSpawnInclusionRadius', config.FurthestSpawnInclusionRadius);
    addSetting('ServerDayLength', config.ServerDayLength);
    addSetting('ServerNightLength', config.ServerNightLength);

    // RCON settings
    iniContent += '\n[SourceRCON]\n';
    addBoolSetting('RCONEnabled', config.RCONEnabled);
    addBoolSetting('RCONLogging', config.RCONLogging);
    addSetting('RCONPassword', config.RCONPassword);

    // Webhooks
    if (config.WebhooksEnabled) {
        iniContent += '\n[ServerWebhooks]\n';
        const webhookFields = [
            'PlayerReport', 'PlayerChat', 'PlayerLogin', 'PlayerLogout',
            'PlayerLeave', 'PlayerKilled', 'PlayerQuestComplete', 'PlayerQuestFailed',
            'PlayerRespawn', 'ServerRestart', 'AdminCommand', 'ServerModerate',
            'PlayerDamagedPlayer'
        ];

        webhookFields.forEach(field => {
            if (config[field]) {
                addSetting(field, config[field]);
            }
        });
    }

    // Create and download the file
    const blob = new Blob([iniContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Game.ini';
    a.click();
    window.URL.revokeObjectURL(url);
});
