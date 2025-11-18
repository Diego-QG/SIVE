import {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {FiCheckSquare, FiDownload, FiExternalLink, FiInfo} from "react-icons/fi";
import {ToggleTema, UserAuth} from "../../index";

export function HomeTemplate() {
    const {user} = UserAuth();
    const asesorName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.displayName || user?.email || "Asesor SIVE";

    const [now, setNow] = useState(new Date());
    const [callForm, setCallForm] = useState({calls: "", answered: ""});
    const [dailyRecord, setDailyRecord] = useState(null);
    const [socialCheck, setSocialCheck] = useState({});

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const dateLabel = useMemo(() => {
        const dateFormatter = new Intl.DateTimeFormat("es-PE", {weekday: "long", day: "numeric", month: "long"});
        const timeFormatter = new Intl.DateTimeFormat("es-PE", {hour: "numeric", minute: "2-digit"});
        return `Hoy es ${dateFormatter.format(now)} – ${timeFormatter.format(now)}`;
    }, [now]);

    const yesterday = useMemo(() => {
        const temp = new Date(now);
        temp.setDate(temp.getDate() - 1);
        return temp;
    }, [now]);

    const yesterdayLabel = useMemo(() => new Intl.DateTimeFormat("es-PE", {day: "numeric", month: "short"}).format(yesterday), [yesterday]);
    const yesterdayRecord = {date: yesterdayLabel, calls: 20, answered: 9};

    const isAfterSix = now.getHours() >= 18;

    const motivationalMessages = [
        "Cada llamada es una oportunidad. ¡Haz que tu día cuente!",
        "Sigue generando confianza en cada conversación.",
        "Escucha primero, propone después: así se construyen cierres." 
    ];
    const inspiration = motivationalMessages[now.getDate() % motivationalMessages.length];

    const communications = [
        {
            id: 1,
            category: "Celebración",
            user: "Daniela Castro",
            area: "People & Culture",
            time: "Hace 15 min",
            title: "Cumpleaños de Ana Torres",
            detail: "🎉 Hoy celebramos a Ana del equipo Editorial Palma. Envía un saludo cálido antes del mediodía."
        },
        {
            id: 2,
            category: "Redes",
            user: "Diego Vargas",
            area: "Marketing",
            time: "Hace 1 h",
            title: "Nuevo post en Facebook",
            detail: "📣 Campaña Escolar 2025 ya está activa. Comparte el enlace con tus profes y deja tu like.",
            requiresSocialCheck: true
        },
        {
            id: 3,
            category: "Materiales",
            user: "Equipo Producto",
            area: "Materiales",
            time: "Ayer",
            title: "Pack “Matemática Viva”",
            detail: "🔔 Nuevos cuadernillos para 3.º primaria listos para envío digital y físico.",
            hasInfoLink: true
        },
        {
            id: 4,
            category: "Campañas",
            user: "Gerencia Comercial",
            area: "Campañas",
            time: "Hace 5 min",
            title: "Campaña navideña 2025",
            detail: "🎯 Desde hoy revisa el guion de llamada y enfoque de promociones de temporada."
        },
        {
            id: 5,
            category: "Redes",
            user: "Social Media",
            area: "Marketing",
            time: "Hoy 9:00 am",
            title: "Historias de Instagram",
            detail: "💬 Reposteamos testimonios de profes aliados. Apoya reaccionando y compartiendo las historias.",
            requiresSocialCheck: true
        }
    ];

    const resources = [
        {
            id: 1,
            title: "Regreso a clases 2025",
            description: "Banners motivacionales",
            type: "motivacional",
            thumbnail: "linear-gradient(135deg, #8EC5FC 0%, #E0C3FC 100%)"
        },
        {
            id: 2,
            title: "Pack Inicial + Primaria",
            description: "Flyers y mockups",
            type: "materiales",
            thumbnail: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
        },
        {
            id: 3,
            title: "Campaña Full Venta Agosto",
            description: "Stories editables",
            type: "campana",
            thumbnail: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)"
        },
        {
            id: 4,
            title: "Mensajes para WhatsApp",
            description: "Listos para copiar",
            type: "materiales",
            thumbnail: "linear-gradient(135deg, #fcb69f 0%, #ffecd2 100%)"
        }
    ];

    const categoryStyles = {
        Celebración: {bg: "#FDF2F8", color: "#BE185D"},
        Redes: {bg: "#ECFDF5", color: "#047857"},
        Materiales: {bg: "#EFF6FF", color: "#1D4ED8"},
        Campañas: {bg: "#FEF3C7", color: "#B45309"}
    };

    const handleCallFormChange = (e) => {
        const {name, value} = e.target;
        setCallForm((prev) => ({...prev, [name]: value}));
    };

    const handleDailyRecord = (e) => {
        e.preventDefault();
        if (!callForm.calls || !callForm.answered) return;
        setDailyRecord({
            date: new Intl.DateTimeFormat("es-PE", {day: "numeric", month: "short"}).format(now),
            calls: Number(callForm.calls),
            answered: Number(callForm.answered)
        });
        setCallForm({calls: "", answered: ""});
    };

    const callDiff = dailyRecord ? dailyRecord.calls - yesterdayRecord.calls : 0;
    const answerDiff = dailyRecord ? dailyRecord.answered - yesterdayRecord.answered : 0;

    const handleToggleSocial = (id) => {
        setSocialCheck((prev) => ({...prev, [id]: !prev[id]}));
    };

    return (
        <Container>
            <ToggleWrapper>
                <ToggleTema />
            </ToggleWrapper>
            <Content>
                <Header>
                    <WelcomeCard>
                        <div>
                            <WelcomeLabel>Bienvenido</WelcomeLabel>
                            <WelcomeTitle>{asesorName}</WelcomeTitle>
                            <WelcomeSubtitle>SIVE · Sistema Integral de Ventas Educativas</WelcomeSubtitle>
                        </div>
                    </WelcomeCard>
                    <MotivationCard>
                        <span>Mensaje del día</span>
                        <p>{inspiration}</p>
                    </MotivationCard>
                </Header>

                <CommunicationsSection>
                    <SectionHeader>
                        <div>
                            <SectionTitle>Comunicados</SectionTitle>
                            <SectionSubtitle>Lo esencial para iniciar tu bloque de llamadas.</SectionSubtitle>
                        </div>
                        <DateBadge>{dateLabel}</DateBadge>
                    </SectionHeader>
                    <CommunicationsList>
                        {communications.map((com) => {
                            const style = categoryStyles[com.category];
                            return (
                                <CommunicationCard key={com.id}>
                                    <Avatar>{com.user.substring(0, 2).toUpperCase()}</Avatar>
                                    <CommunicationContent>
                                        <CommunicationTop>
                                            <div>
                                                <CommunicationTitle>{com.title}</CommunicationTitle>
                                                <CommunicationMeta>
                                                    <strong>{com.user}</strong> · {com.area} · {com.time}
                                                </CommunicationMeta>
                                            </div>
                                            <CategoryChip style={{background: style?.bg, color: style?.color}}>{com.category}</CategoryChip>
                                        </CommunicationTop>
                                        <CommunicationDetail>{com.detail}</CommunicationDetail>
                                        {com.requiresSocialCheck && (
                                            <SocialAction>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(socialCheck[com.id])}
                                                        onChange={() => handleToggleSocial(com.id)}
                                                    />
                                                    ✔️ Ya lo hice
                                                </label>
                                            </SocialAction>
                                        )}
                                        {com.hasInfoLink && (
                                            <MaterialAction>
                                                <span>Actualiza tu discurso con las fichas más recientes.</span>
                                                <ActionButton type="button">
                                                    Ir a Información <FiExternalLink />
                                                </ActionButton>
                                            </MaterialAction>
                                        )}
                                    </CommunicationContent>
                                </CommunicationCard>
                            );
                        })}
                    </CommunicationsList>
                    <PrimaryButton type="button">
                        Ver más comunicados
                        <FiInfo />
                    </PrimaryButton>
                </CommunicationsSection>

                <SummarySection>
                    <SectionHeader>
                        <div>
                            <SectionTitle>Resumen rápido del día</SectionTitle>
                            <SectionSubtitle>Registra tu actividad desde las 6:00 pm para cerrar la jornada.</SectionSubtitle>
                        </div>
                    </SectionHeader>
                    <SummaryGrid>
                        <SummaryCard>
                            <SummaryTitle>Registro de hoy</SummaryTitle>
                            <SummaryForm onSubmit={handleDailyRecord}>
                                <label>
                                    Total de llamadas
                                    <input
                                        type="number"
                                        name="calls"
                                        placeholder="Ej. 22"
                                        value={callForm.calls}
                                        onChange={handleCallFormChange}
                                        disabled={!isAfterSix}
                                        min="0"
                                    />
                                </label>
                                <label>
                                    Profesores que contestaron
                                    <input
                                        type="number"
                                        name="answered"
                                        placeholder="Ej. 11"
                                        value={callForm.answered}
                                        onChange={handleCallFormChange}
                                        disabled={!isAfterSix}
                                        min="0"
                                    />
                                </label>
                                <PrimaryButton as="button" type="submit" disabled={!isAfterSix}>
                                    Guardar registro
                                    <FiCheckSquare />
                                </PrimaryButton>
                                {!isAfterSix && <HelperText>Disponible a partir de las 6:00 pm.</HelperText>}
                            </SummaryForm>
                        </SummaryCard>
                        <SummaryCard>
                            <SummaryTitle>Comparativas</SummaryTitle>
                            {dailyRecord ? (
                                <Comparisons>
                                    <ComparisonItem>
                                        <span>{dailyRecord.date} — {dailyRecord.calls} llamadas</span>
                                        <strong>{callDiff >= 0 ? `+${callDiff}` : callDiff} que ayer</strong>
                                    </ComparisonItem>
                                    <ComparisonItem>
                                        <span>Profesores que contestaron: {dailyRecord.answered}</span>
                                        <strong>{answerDiff >= 0 ? `+${answerDiff}` : answerDiff} que ayer</strong>
                                    </ComparisonItem>
                                    <Divider />
                                    <ComparisonItem>
                                        <span>Llamadas de ayer: {yesterdayRecord.calls}</span>
                                        <small>Para mañana: usa esta base como meta mínima.</small>
                                    </ComparisonItem>
                                </Comparisons>
                            ) : (
                                <PendingState>
                                    <p>Llamadas de ayer: {yesterdayRecord.calls}</p>
                                    <p>Llamadas de hoy: <strong>[esperando registro]</strong></p>
                                    <small>El formulario se habilita luego de las 6:00 pm.</small>
                                </PendingState>
                            )}
                        </SummaryCard>
                    </SummaryGrid>
                </SummarySection>

                <ResourcesSection>
                    <SectionHeader>
                        <div>
                            <SectionTitle>Recursos visuales listos</SectionTitle>
                            <SectionSubtitle>Comparte piezas motivacionales, materiales o campañas en segundos.</SectionSubtitle>
                        </div>
                    </SectionHeader>
                    <ResourceGrid>
                        {resources.map((resource) => (
                            <ResourceCard key={resource.id} $thumbnail={resource.thumbnail}>
                                <ResourceText>
                                    <ResourceTitle>{resource.title}</ResourceTitle>
                                    <ResourceSubtitle>{resource.description}</ResourceSubtitle>
                                </ResourceText>
                                <ResourceActions>
                                    <ResourceButton>
                                        <FiDownload />
                                        Descargar todo
                                    </ResourceButton>
                                    {resource.type === "materiales" && (
                                        <ResourceButton variant="ghost">
                                            Más información →
                                        </ResourceButton>
                                    )}
                                </ResourceActions>
                            </ResourceCard>
                        ))}
                    </ResourceGrid>
                </ResourcesSection>
            </Content>
        </Container>
    );
}

const Container = styled.section`
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 40%, #ffffff 100%);
    padding: 32px 24px 60px;
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
`;

const Content = styled.div`
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
`;

const Header = styled.header`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
`;

const CardBase = styled.div`
    background: #ffffff;
    border-radius: 24px;
    padding: 28px;
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
`;

const WelcomeCard = styled(CardBase)`
    display: flex;
    align-items: flex-start;
    gap: 12px;
`;

const WelcomeLabel = styled.span`
    font-size: 0.85rem;
    color: #64748b;
    letter-spacing: 0.05em;
    text-transform: uppercase;
`;

const WelcomeTitle = styled.h1`
    margin: 6px 0 0;
    font-size: 1.6rem;
    color: #0f172a;
`;

const WelcomeSubtitle = styled.p`
    margin: 6px 0 0;
    color: #475569;
`;

const MotivationCard = styled(CardBase)`
    background: #0f172a;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    gap: 12px;

    span {
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.65);
    }

    p {
        margin: 0;
        font-size: 1.1rem;
    }
`;

const CommunicationsSection = styled(CardBase)`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SectionHeader = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
`;

const SectionTitle = styled.h2`
    margin: 0;
    font-size: 1.35rem;
    color: #0f172a;
`;

const SectionSubtitle = styled.p`
    margin: 6px 0 0;
    color: #64748b;
`;

const DateBadge = styled.span`
    padding: 10px 18px;
    border-radius: 999px;
    background: #e0ecff;
    color: #1d4ed8;
    font-weight: 600;
    text-transform: capitalize;
`;

const CommunicationsList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const CommunicationCard = styled.article`
    display: flex;
    gap: 16px;
    padding: 18px;
    background: #f8fafc;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
`;

const Avatar = styled.div`
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: linear-gradient(135deg, #93a5cf 0%, #e4efe9 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #0f172a;
`;

const CommunicationContent = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const CommunicationTop = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 16px;
`;

const CommunicationTitle = styled.h3`
    margin: 0;
    font-size: 1.05rem;
    color: #0f172a;
`;

const CommunicationMeta = styled.p`
    margin: 6px 0 0;
    color: #475569;
    font-size: 0.9rem;
`;

const CategoryChip = styled.span`
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 0.85rem;
`;

const CommunicationDetail = styled.p`
    margin: 0;
    color: #475569;
`;

const SocialAction = styled.div`
    label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #047857;
    }

    input {
        width: 18px;
        height: 18px;
        accent-color: #10b981;
    }
`;

const MaterialAction = styled.div`
    padding: 12px;
    border-radius: 14px;
    background: #eff6ff;
    color: #1d4ed8;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
`;

const ActionButton = styled.button`
    border: none;
    background: transparent;
    color: #1d4ed8;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
`;

const PrimaryButton = styled.button`
    padding: 12px 20px;
    border-radius: 999px;
    border: none;
    background: #2563eb;
    color: #ffffff;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const SummarySection = styled(CardBase)`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const SummaryGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
`;

const SummaryCard = styled.div`
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    padding: 20px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const SummaryTitle = styled.h3`
    margin: 0;
    color: #0f172a;
`;

const SummaryForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 12px;

    label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        color: #475569;
        font-weight: 600;
    }

    input {
        border-radius: 12px;
        border: 1px solid #cbd5f5;
        padding: 10px 12px;
        font-size: 1rem;
    }
`;

const HelperText = styled.small`
    color: #94a3b8;
`;

const Comparisons = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ComparisonItem = styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #0f172a;

    strong {
        color: #2563eb;
    }

    small {
        color: #94a3b8;
    }
`;

const Divider = styled.hr`
    border: none;
    border-top: 1px dashed #cbd5f5;
`;

const PendingState = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #475569;
`;

const ResourcesSection = styled(CardBase)`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

const ResourceGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 18px;
`;

const ResourceCard = styled.div`
    border-radius: 20px;
    padding: 20px;
    min-height: 200px;
    background: ${(props) => props.$thumbnail};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #0f172a;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
`;

const ResourceText = styled.div`
    color: #0f172a;
`;

const ResourceTitle = styled.h3`
    margin: 0;
    font-size: 1.1rem;
`;

const ResourceSubtitle = styled.p`
    margin: 6px 0 0;
    color: #334155;
`;

const ResourceActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const ResourceButton = styled.button`
    border: none;
    border-radius: 14px;
    padding: 10px 14px;
    font-weight: 600;
    font-size: 0.95rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    color: ${(props) => (props.variant === "ghost" ? "#0f172a" : "#ffffff")};
    background: ${(props) => (props.variant === "ghost" ? "rgba(15, 23, 42, 0.12)" : "rgba(15, 23, 42, 0.85)")};
`;

const ToggleWrapper = styled.div`
    position: fixed;
    top: 15px;
    right: 20px;
    z-index: 10;
`;