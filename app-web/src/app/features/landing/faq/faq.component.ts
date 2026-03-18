import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AccordionModule, CardModule, DividerModule, PanelModule, AvatarModule, ButtonModule, RouterLink],
  template: `
    <section class="faq-header py-20 px-4 bg-gradient-to-br from-surface-50 to-white">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-primary mb-6">
          Preguntas Frecuentes
        </h1>
        <p class="text-xl text-surface-600 max-w-2xl mx-auto">
          Encuentra respuestas a las preguntas más comunes sobre CitasYa
        </p>
      </div>
    </section>

    <section class="faq-content py-12 px-4 bg-white">
      <div class="max-w-4xl mx-auto">
        <!-- General Questions -->
        <p-card header="Preguntas Generales" styleClass="mb-8">
          <p-accordion [multiple]="true">
            <p-accordion-panel value="0">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-question-circle" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Qué es CitasYa?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  CitasYa es una plataforma SaaS que permite a pequeños negocios de servicios (peluquerías, clínicas dentales, spas, etc.) gestionar sus citas y empleados de manera eficiente. Los clientes pueden agendar sin necesidad de registrarse, y los negocios obtienen un back office completo para administrar todo.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="1">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-question-circle" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Necesito tarjeta de crédito para la prueba gratuita?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  No. Ofrecemos 14 días de prueba gratuita en el plan Básico sin necesidad de ingresar información de pago. Solo necesitas crear una cuenta con tu email.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="2">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-question-circle" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Hay contrato de permanencia?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Absolutamente no. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones. Tu negocio, tus reglas.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="3">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-question-circle" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Puedo cambiar de plan?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Sí, puedes actualizar o cambiar tu plan en cualquier momento. Los cambios se aplicarán en tu próximo ciclo de facturación. Si subes de plan, tendrás acceso inmediato a las nuevas funcionalidades.
                </p>
              </p-accordion-content>
            </p-accordion-panel>
          </p-accordion>
        </p-card>

        <!-- Technical Questions -->
        <p-card header="Preguntas Técnicas" styleClass="mb-8">
          <p-accordion [multiple]="true">
            <p-accordion-panel value="4">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-cog" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Funciona en móvil?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed mb-4">
                  Sí, CitasYa está diseñado con enfoque "Mobile First". Funciona perfectamente en smartphones, tablets y computadoras. Además:
                </p>
                <ul class="list-disc list-inside text-surface-600 space-y-2 ml-4">
                  <li>Tus clientes pueden agendar desde cualquier dispositivo</li>
                  <li>Tú y tu equipo pueden gestionar citas desde el móvil</li>
                  <li>Es una Progressive Web App (PWA), por lo que se puede instalar como app en el teléfono</li>
                </ul>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="5">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-cog" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Necesito instalar algo?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  No es necesario. CitasYa es una aplicación web, funciona directamente en tu navegador. Sin embargo, puedes instalarla como PWA en tu móvil para acceso más rápido y notificaciones push.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="6">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-cog" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Qué pasa si se cae internet?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Como es una aplicación web, necesitas conexión a internet para usar CitasYa. Sin embargo, gracias a la tecnología PWA, algunas funcionalidades básicas pueden funcionar offline. Recomendamos tener un plan de respaldo (como una agenda física) para casos extremos.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="7">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-cog" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Es seguro?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Absolutamente. Usamos encriptación SSL/TLS para todas las comunicaciones. Los datos se almacenan en servidores seguros con múltiples copias de respaldo. Implementamos autenticación robusta y políticas de seguridad a nivel de fila (RLS) para garantizar que solo tú veas tus datos.
                </p>
              </p-accordion-content>
            </p-accordion-panel>
          </p-accordion>
        </p-card>

        <!-- Business Questions -->
        <p-card header="Preguntas sobre el Negocio" styleClass="mb-8">
          <p-accordion [multiple]="true">
            <p-accordion-panel value="8">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-briefcase" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Cuántos empleados puedo tener?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Depende de tu plan:
                </p>
                <ul class="list-disc list-inside text-surface-600 space-y-2 ml-4 mt-2">
                  <li><strong>Básico ($25/mes):</strong> Hasta 10 usuarios (1 manager + 9 empleados)</li>
                  <li><strong>Medio ($60/mes):</strong> Hasta 20 usuarios (1 manager + 19 empleados)</li>
                  <li><strong>Custom:</strong> Usuarios ilimitados</li>
                </ul>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="9">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-briefcase" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Puedo tener múltiples sucursales?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Sí. El plan Básico incluye 1 empresa, el plan Medio incluye 2 empresas, y el plan Custom te permite gestionar empresas ilimitadas. Cada empresa tiene su propio calendario, empleados y configuración.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="10">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-briefcase" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Los clientes necesitan registrarse?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  No, y esa es una de nuestras ventajas principales. Tus clientes pueden agendar citas simplemente proporcionando su nombre y teléfono. Esto reduce la fricción y aumenta la tasa de conversión. Si lo deseas, pueden proporcionar email opcional para recibir confirmaciones.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="11">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-briefcase" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Cómo funciona el cierre diario?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Al final del día, el manager puede generar un "cierre diario" con un clic. El sistema calcula automáticamente el total de citas atendidas, ingresos por empleado, y genera un PDF que puedes descargar o imprimir. Es ideal para conciliar caja y llevar control financiero.
                </p>
              </p-accordion-content>
            </p-accordion-panel>
          </p-accordion>
        </p-card>

        <!-- Support Questions -->
        <p-card header="Soporte" styleClass="mb-8">
          <p-accordion [multiple]="true">
            <p-accordion-panel value="12">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-headphones" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Qué tipo de soporte ofrecen?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Depende de tu plan:
                </p>
                <ul class="list-disc list-inside text-surface-600 space-y-2 ml-4 mt-2">
                  <li><strong>Básico:</strong> Soporte por email, respuesta en 24-48 horas</li>
                  <li><strong>Medio:</strong> Soporte prioritario, respuesta en 12-24 horas</li>
                  <li><strong>Custom:</strong> Soporte dedicado 24/7 con chat en vivo</li>
                </ul>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="13">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-headphones" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Ofrecen capacitación?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Sí, tenemos videos tutoriales, guías escritas y webinars mensuales gratuitos. Para planes Custom, ofrecemos capacitación personalizada para tu equipo.
                </p>
              </p-accordion-content>
            </p-accordion-panel>

            <p-accordion-panel value="14">
              <p-accordion-header>
                <div class="flex items-center gap-3">
                  <p-avatar icon="pi pi-headphones" styleClass="bg-primary text-white" size="small" shape="circle"></p-avatar>
                  <span>¿Tienen documentación?</span>
                </div>
              </p-accordion-header>
              <p-accordion-content>
                <p class="m-0 text-surface-600 leading-relaxed">
                  Sí, contamos con una base de conocimiento completa con artículos, guías paso a paso, y video tutoriales. También tenemos una comunidad de usuarios donde puedes hacer preguntas y compartir tips.
                </p>
              </p-accordion-content>
            </p-accordion-panel>
          </p-accordion>
        </p-card>
      </div>
    </section>

    <p-divider></p-divider>

    <!-- Still have questions -->
    <section class="still-have-questions py-12 px-4 bg-surface-50">
      <div class="max-w-4xl mx-auto text-center">
        <p-card>
          <ng-template pTemplate="content">
            <div class="py-8">
              <p-avatar icon="pi pi-envelope" styleClass="bg-primary text-white text-3xl mb-4" size="xlarge" shape="circle"></p-avatar>
              <h2 class="text-2xl font-bold text-primary mb-4">¿Aún tienes dudas?</h2>
              <p class="text-surface-600 mb-6 max-w-xl mx-auto">
                No dudes en contactarnos. Nuestro equipo está listo para ayudarte con cualquier pregunta que tengas.
              </p>
              <p-button 
                label="Contactar soporte" 
                icon="pi pi-send"
                iconPos="right"
                styleClass="p-button-lg p-button-primary"
                [routerLink]="['/contact']"
              />
            </div>
          </ng-template>
        </p-card>
      </div>
    </section>
  `
})
export class FaqComponent {}
