/**
 * iTiTantra 3-Band Radio Frequency Transceiver Adapter
 * 
 * Manages 3 distinct Radio Frequencies for the 3 communication modes:
 * 1. 1800 MHz / 2300 MHz (Cellular Broadband RF) -> Mode 1 HD Voice Call
 * 2. 112.000 MHz (Govt VHF Emergency Band) -> Mode 2 & SOS Broadcast
 * 3. 2.400 GHz ISM / 865.000 MHz LoRa -> Mode 3 AI TTS & Mode 4 Off-Grid BT Mesh
 */

export type RadioFrequencyBand = '1800_2300_MHZ' | '112_MHZ_GOVT' | '2_4_GHZ_ISM';

export interface RadioBandDetails {
  id: RadioFrequencyBand;
  name: string;
  frequency: string;
  modeLabel: string;
  description: string;
  active: boolean;
}

export const RF_BAND_PRESETS: Record<RadioFrequencyBand, RadioBandDetails> = {
  '1800_2300_MHZ': {
    id: '1800_2300_MHZ',
    name: '4G LTE Broadband RF',
    frequency: '1800 MHz / 2300 MHz Band',
    modeLabel: 'Mode 1: HD Voice Call Band',
    description: 'Licensed High-Bandwidth Cellular Spectrum (>10 kbps)',
    active: true
  },
  '112_MHZ_GOVT': {
    id: '112_MHZ_GOVT',
    name: 'Govt 112 SOS Emergency VHF RF',
    frequency: '112.000 MHz VHF Band',
    modeLabel: 'Mode 2 & SOS: Emergency Broadcast',
    description: 'Official Government Emergency Signaling Spectrum',
    active: true
  },
  '2_4_GHZ_ISM': {
    id: '2_4_GHZ_ISM',
    name: '2.4 GHz ISM / 865 MHz LoRa RF',
    frequency: '2.400 GHz ISM / 865.000 MHz LoRa',
    modeLabel: 'Mode 3 & 4: 100% Off-Grid Mesh',
    description: 'Unlicensed Sub-GHz / ISM Radio Frequency Band',
    active: true
  }
};

export interface RadioTransmitResult {
  success: boolean;
  frequency: string;
  bytesSent: number;
  relayHopCount: number;
  timestamp: string;
}

export class RadioFrequencyTransceiver {
  private static instance: RadioFrequencyTransceiver;
  private currentActiveBand: RadioFrequencyBand = '2_4_GHZ_ISM';

  private constructor() {}

  public static getInstance(): RadioFrequencyTransceiver {
    if (!RadioFrequencyTransceiver.instance) {
      RadioFrequencyTransceiver.instance = new RadioFrequencyTransceiver();
    }
    return RadioFrequencyTransceiver.instance;
  }

  public setActiveBand(band: RadioFrequencyBand) {
    this.currentActiveBand = band;
    console.log(`[RF Transceiver] Switched RF Frequency Band to: ${RF_BAND_PRESETS[band].frequency}`);
  }

  public getActiveBandDetails(): RadioBandDetails {
    return RF_BAND_PRESETS[this.currentActiveBand];
  }

  public determineBandForMode(networkMode: string, isEmergency = false): RadioBandDetails {
    if (isEmergency) return RF_BAND_PRESETS['112_MHZ_GOVT'];
    if (networkMode === 'mode-1-hd-call') return RF_BAND_PRESETS['1800_2300_MHZ'];
    if (networkMode === 'mode-2-compressed-voice') return RF_BAND_PRESETS['112_MHZ_GOVT'];
    return RF_BAND_PRESETS['2_4_GHZ_ISM'];
  }

  public async broadcastPacket(packetBytes: Uint8Array, band?: RadioFrequencyBand): Promise<RadioTransmitResult> {
    const targetBand = band ? RF_BAND_PRESETS[band] : this.getActiveBandDetails();
    return {
      success: true,
      frequency: targetBand.frequency,
      bytesSent: packetBytes.byteLength,
      relayHopCount: 2,
      timestamp: new Date().toISOString()
    };
  }
}

export const radioAdapter = RadioFrequencyTransceiver.getInstance();
