'use strict';
var exports = module.exports
    , prefixHome = 'mamut/'
    , prefixCDR = prefixHome + 'movistar/cdr/'
    , prefixClima = prefixHome + 'dmc/'
    , prefixCell = prefixHome + 'cell/'
    ;


var Constants = {

    Prefix:{
        HOME: prefixHome,
        TRANSANTIAGO: prefixHome + 'gtfs/Transantiago/',
        CDR_HOME: prefixCDR,
        CDR_DATA: prefixCDR + 'data/',
        CDR_SMS: prefixCDR + 'sms/',
        CDR_MMS: prefixCDR + 'mms/',
        CDR_VOICE: prefixCDR + 'voice/',
        DMC_HOME: prefixClima,
        DMC_TEMPERATURA: prefixClima + 'temperatura/',
        DMC_AGUACAIDA: prefixClima + 'aguacaida/' ,
        DMC_RADIACION: prefixClima + '/radiacionglobal',
        DMC_VIENTO: prefixClima + 'viento/',
        DMC_PRESION_HUMEDAD: prefixClima + 'presionhumedad/',
        CELL_HOME: prefixCell,
        CELL_LTE: prefixCell + 'lte/',
        CELL_GSM: prefixCell + 'gsm/',

    }
};

module.exports = Constants;
