package ${core:postProcess('##LOCALIZACION##','ALC')}.${core:postProcess('##NEGOCIO##','ALC')}.${core:postProcess('##BACKEND##','ALC')}.${core:postProcess('##OBJDEDATOS##','ALC')}${core:postProcess('##INTERFAZPACKAGE##','ALC','.%%')}.${core:postProcess('##OPECOMBACKEND##','ALC')}.util;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import java.util.Properties;

import org.apache.log4j.BasicConfigurator;
import org.apache.log4j.PropertyConfigurator;

/**
 * Clase encargada de las configuraciones.
 * <br>
 * <b>Log4jLoadProperties</b>
 * <br>
 * Utilitario que carga las configuraciones del log4j.
 * <br>
 * Registro de versiones:
 * <ul>
 * <li>1.0 27/01/2015 Rodolfo Kafack Ghinelli (SEnTRA): Versi�n inicial.</li>
 * </ul>
 */
public class Log4jLoadProperties {
	/**
     * Archivo de propiedades.
     */
    private static final String CONFIG_LOG4J = "./Corp/AppProperties/&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}_log4j.properties";
    /**
     * Atributo de instacia las configuraciones del log4j.
     */
    private static Log4jLoadProperties log4jLoadProperties;
    
    /**
     * M�todo para cargar las configuraciones del log4j.
     * <br>
     * Registro de Versiones:
     * <ul>
     * <li>1.0 27/01/2015 Rodolfo Kafack Ghinelli (SEnTRA): Versi�n inicial.</li>
     * </ul>
     * @since 1.0
     */
    private Log4jLoadProperties() {
        InputStream inputStream;
        try {
            inputStream = new FileInputStream(CONFIG_LOG4J);
            Properties prop = new Properties();
            prop.load(inputStream);
            PropertyConfigurator.configure(prop);
        } catch (FileNotFoundException e) {
            System.out.println("[&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}_log4j] no fue posible configurar log4j, el archivo de configuracion no fue encontrado.");
            BasicConfigurator.configure();
        } catch (IOException e) {
            System.out.println("[&{(auc)negocio}_&{(auc)localizacion}_&{(auc)backend}_##OBJDEDATOS####INTERFAZPACKAGE####OPECOMBACKEND##-&{(urd)versionSvc}_log4j] no fue posible configurar log4j, no es posible leer la configuraci�n.");
            BasicConfigurator.configure();
        }
    }
    
    /**
     * M�todo para inicializar el log4j.
     * <br>
     * Registro de Versiones:
     * <ul>
     * <li>1.0 27/01/2015 Rodolfo Kafack Ghinelli (SEnTRA): Versi�n inicial.</li>
     * </ul>
     * @since 1.0
     */
    public static synchronized void iniLog4j() {
        if (log4jLoadProperties == null) {
            log4jLoadProperties = new Log4jLoadProperties();
        }
    }

}
