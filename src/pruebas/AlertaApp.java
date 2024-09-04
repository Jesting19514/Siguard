package pruebas;
import java.awt.*;
import javax.swing.*;
import java.awt.event.WindowAdapter;
import java.awt.event.WindowEvent;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import com.formdev.flatlaf.FlatLightLaf; // Importa el tema FlatLaf
public class AlertaApp {

    private static Timer timer = new Timer();
    private static Map<String, ArrayList<Alerta>> alertasPorContrato = new HashMap<>();
    private static JFrame mainFrame; // Ventana principal
    private static JPanel alertasPanel; // Panel para alertas

    // Clase para representar una alerta con nombre de contrato y fecha de término
    private static class Alerta {
        String nombreContrato;
        Date fechaTermino;
        Alerta(String nombreContrato, Date fechaTermino, TimerTask tarea) {
            this.nombreContrato = nombreContrato;
            this.fechaTermino = fechaTermino;
        }
    }

    public static void main(String[] args) {
        // Establecer el tema FlatLaf antes de inicializar la interfaz
        try {
            UIManager.setLookAndFeel(new FlatLightLaf());
        } catch (Exception ex) {
            System.err.println("Failed to initialize LaF");
        }

        SwingUtilities.invokeLater(AlertaApp::mostrarMenuPrincipal);
    }

    private static void mostrarMenuPrincipal() {
        // Crear la ventana principal
        mainFrame = new JFrame("Sistema de Alertas");
        mainFrame.setDefaultCloseOperation(JFrame.DO_NOTHING_ON_CLOSE); // Deshabilitar el cierre por defecto
        mainFrame.setSize(600, 400);
        mainFrame.setLocationRelativeTo(null); // Centra la ventana en la pantalla

        // Añadir el WindowListener para manejar el cierre de la ventana
        mainFrame.addWindowListener(new WindowAdapter() {
            @Override
            public void windowClosing(WindowEvent e) {
                detenerEjecucion();
                System.exit(0); // Salir del programa
            }
        });

        // Crear el panel principal con CardLayout
        JPanel mainPanel = new JPanel(new CardLayout());
        mainFrame.add(mainPanel);

        // Crear las vistas
        JPanel menuPanel = createMenuPanel(mainPanel);
        JPanel programadorPanel = createProgramadorPanel(mainPanel);
        JPanel alertasPanel = createAlertasPanel(mainPanel);

        // Agregar las vistas al panel principal
        mainPanel.add(menuPanel, "Menu");
        mainPanel.add(programadorPanel, "Programador");
        mainPanel.add(alertasPanel, "Alertas");

        // Mostrar la ventana principal
        mainFrame.setVisible(true);
    }

    private static JPanel createMenuPanel(JPanel mainPanel) {
        JPanel menuPanel = new JPanel();
        JButton nuevoContratoButton = new JButton("Nuevo Contrato");
        JButton mostrarAlertasButton = new JButton("Mostrar Alertas");

        // Acción para abrir la vista de programación de alertas
        nuevoContratoButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) (mainPanel.getLayout());
            cl.show(mainPanel, "Programador");
        });

        // Acción para mostrar las alertas creadas
        mostrarAlertasButton.addActionListener(e -> {
            actualizarAlertasPanel();
            CardLayout cl = (CardLayout) (mainPanel.getLayout());
            cl.show(mainPanel, "Alertas");
        });

        menuPanel.add(nuevoContratoButton);
        menuPanel.add(mostrarAlertasButton);
        return menuPanel;
    }

    private static JPanel createProgramadorPanel(JPanel mainPanel) {
        JPanel programadorPanel = new JPanel();
        JLabel label1 = new JLabel("Nombre del Contrato:");
        JLabel label2 = new JLabel("Selecciona la fecha de inicio:");
        JLabel label3 = new JLabel("Fecha de término:");
        JLabel label4 = new JLabel("Intervalo en meses:");
        JTextField nombreContratoInput = new JTextField(20);
        JTextField intervalInput = new JTextField(5);

        // Configurar los selectores de fecha
        JSpinner startDateSpinner = new JSpinner(new SpinnerDateModel());
        JSpinner endDateSpinner = new JSpinner(new SpinnerDateModel());
        JSpinner.DateEditor startEditor = new JSpinner.DateEditor(startDateSpinner, "dd-MM-yyyy");
        JSpinner.DateEditor endEditor = new JSpinner.DateEditor(endDateSpinner, "dd-MM-yyyy");
        startDateSpinner.setEditor(startEditor);
        endDateSpinner.setEditor(endEditor);

        JButton startButton = new JButton("Iniciar");
        JButton stopButton = new JButton("Eliminar alertas");
        JButton backButton = new JButton("Regresar");

        programadorPanel.add(label1);
        programadorPanel.add(nombreContratoInput);
        programadorPanel.add(label2);
        programadorPanel.add(startDateSpinner);
        programadorPanel.add(label3);
        programadorPanel.add(endDateSpinner);
        programadorPanel.add(label4);
        programadorPanel.add(intervalInput);
        programadorPanel.add(startButton);
        programadorPanel.add(stopButton);
        programadorPanel.add(backButton);

        // Acción para iniciar las alertas
        startButton.addActionListener(e -> {
            try {
                String nombreContrato = nombreContratoInput.getText();
                int intervalMonths = Integer.parseInt(intervalInput.getText());
                Date startDate = (Date) startDateSpinner.getValue();
                Date endDate = (Date) endDateSpinner.getValue();
        
                // Validaciones
                if (!validarFechas(startDate, endDate)) {
                    return;
                }
        
                Calendar calendar = Calendar.getInstance();
                calendar.setTime(startDate);
        
                ArrayList<Alerta> alertasContrato = new ArrayList<>();
        
                while (calendar.getTime().before(endDate)) {
                    calendar.add(Calendar.MONTH, intervalMonths);
                    Date alertTime = calendar.getTime();
        
                    if (alertTime.before(endDate)) {
                        TimerTask tarea = new TimerTask() {
                            @Override
                            public void run() {
                                mostrarNotificacion("Alerta de Contrato: "+nombreContrato, "Tiempo restante: " + calcularTiempoRestante(endDate));
                            }
                        };
                        Alerta alerta = new Alerta(nombreContrato, endDate, tarea);
                        alertasContrato.add(alerta);
                        timer.schedule(tarea, alertTime);
                    }
                }
        
                // Alertas semanales durante el último mes
                long diasRestantes = (endDate.getTime() - calendar.getTime().getTime()) / (1000 * 60 * 60 * 24);
        
                if (diasRestantes <= 30) {
                    calendar.setTime(endDate);
                    calendar.add(Calendar.DAY_OF_MONTH, -30); // Establece la fecha de inicio de alertas semanales
        
                    while (calendar.getTime().before(endDate)) {
                        calendar.add(Calendar.WEEK_OF_YEAR, 1);
                        Date alertTime = calendar.getTime();
        
                        if (alertTime.before(endDate)) {
                            TimerTask tareaSemanal = new TimerTask() {
                                @Override
                                public void run() {
                                    mostrarNotificacion("Alerta Semanal de Contrato: "+nombreContrato, "¡Queda menos de un mes! Tiempo restante: " + calcularTiempoRestante(endDate));
                                }
                            };
                            Alerta alertaSemanal = new Alerta(nombreContrato, endDate, tareaSemanal);
                            alertasContrato.add(alertaSemanal);
                            timer.schedule(tareaSemanal, alertTime);
                        }
                    }
                }
        
                alertasPorContrato.put(nombreContrato, alertasContrato);
        
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(mainFrame, "Por favor ingrese un intervalo válido en meses.");
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(mainFrame, "Ocurrió un error al iniciar las alertas: " + ex.getMessage());
            }
        });

        // Acción para detener las alertas
        stopButton.addActionListener(e -> {
            detenerEjecucion(); // Detener alertas
            JOptionPane.showMessageDialog(mainFrame, "Las alertas han sido eliminadas.");
        });

        // Acción para regresar al menú principal
        backButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) (mainPanel.getLayout());
            cl.show(mainPanel, "Menu");
        });

        return programadorPanel;
    }

    private static JPanel createAlertasPanel(JPanel mainPanel) {
        JPanel panel = new JPanel(new BorderLayout());

        alertasPanel = new JPanel();
        alertasPanel.setLayout(new BoxLayout(alertasPanel, BoxLayout.Y_AXIS));

        // Coloca el panel de alertas dentro de un JScrollPane
        JScrollPane scrollPane = new JScrollPane(alertasPanel);
        scrollPane.setVerticalScrollBarPolicy(JScrollPane.VERTICAL_SCROLLBAR_ALWAYS);
        scrollPane.setHorizontalScrollBarPolicy(JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED);

        panel.add(scrollPane, BorderLayout.CENTER);

        JPanel buttonPanel = new JPanel();
        JButton backButton = new JButton("Regresar");
        buttonPanel.add(backButton);

        // Acción para regresar al menú principal
        backButton.addActionListener(e -> {
            CardLayout cl = (CardLayout) (mainPanel.getLayout());
            cl.show(mainPanel, "Menu");
        });

        panel.add(buttonPanel, BorderLayout.SOUTH);

        return panel;
    }

    private static void actualizarAlertasPanel() {
        alertasPanel.removeAll();
        if (alertasPorContrato.isEmpty()) {
            alertasPanel.add(new JLabel("No hay alertas creadas."));
        } else {
            for (Map.Entry<String, ArrayList<Alerta>> entry : alertasPorContrato.entrySet()) {
                String nombreContrato = entry.getKey();
                ArrayList<Alerta> alertasContrato = entry.getValue();

                JPanel contratoPanel = new JPanel();
                contratoPanel.setLayout(new BoxLayout(contratoPanel, BoxLayout.Y_AXIS));
                contratoPanel.add(new JLabel("Contrato: " + nombreContrato));

                for (Alerta alerta : alertasContrato) {
                    JButton testButton = new JButton("Probar Alerta para " + alerta.nombreContrato);
                    JLabel alertaLabel = new JLabel("Alerta programada para: " + alerta.fechaTermino + " (Tiempo restante hasta el término del contrato: " + calcularTiempoRestante(alerta.fechaTermino) + ")");

                    testButton.addActionListener(e -> {
                        mostrarNotificacion("Recordatorio de Contrato", "Recordatorio de Contrato: " + alerta.nombreContrato + " (Tiempo restante hasta el término del contrato: " + calcularTiempoRestante(alerta.fechaTermino) + ")");
                    });

                    contratoPanel.add(alertaLabel);
                    contratoPanel.add(testButton);
                }

                alertasPanel.add(contratoPanel);
            }
        }
        
        // Forzar actualización de la interfaz
        alertasPanel.revalidate();
        alertasPanel.repaint();
    }

    private static void mostrarNotificacion(String titulo, String mensaje) {
        if (SystemTray.isSupported()) {
            TrayIcon trayIcon = new TrayIcon(Toolkit.getDefaultToolkit().getImage(""), "");
            trayIcon.setImageAutoSize(true);
            try {
                SystemTray.getSystemTray().add(trayIcon);
                trayIcon.displayMessage(titulo, mensaje, TrayIcon.MessageType.INFO);
            } catch (AWTException e) {
                e.printStackTrace();
            }
        } else {
            JOptionPane.showMessageDialog(mainFrame, "Sistema de bandeja no soportado.");
        }
    }

    private static String calcularTiempoRestante(Date fechaTermino) {
        long diff = fechaTermino.getTime() - System.currentTimeMillis();
        long days = diff / (1000 * 60 * 60 * 24);
        return days + " días";
    }

    private static boolean validarFechas(Date startDate, Date endDate) {
        // Verificar que la fecha de inicio y fin no sean iguales
        if (startDate.equals(endDate)) {
            JOptionPane.showMessageDialog(null, "La fecha de inicio y la fecha de término no pueden ser iguales.");
            return false;
        }

        // Verificar que haya una diferencia de al menos 2 meses
        Calendar startCal = Calendar.getInstance();
        startCal.setTime(startDate);
        Calendar endCal = Calendar.getInstance();
        endCal.setTime(endDate);

        startCal.add(Calendar.MONTH, 2);
        if (startCal.after(endCal)) {
            JOptionPane.showMessageDialog(null, "La diferencia entre la fecha de inicio y la fecha de término debe ser de al menos 2 meses.");
            return false;
        }

        return true;
    }

    // Método para detener la ejecución y limpiar los recursos
    private static void detenerEjecucion() {
        timer.cancel();
        timer = new Timer(); // Reinicia el temporizador
        alertasPorContrato.clear(); // Limpiar la lista de alertas
    }
}