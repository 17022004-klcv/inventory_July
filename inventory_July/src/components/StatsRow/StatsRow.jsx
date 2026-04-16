export default function StatsRow({ estadisticas }) {
    return (
        <div className="stats-row">
            <div className="stat-card">
                <div className="stat-num">{estadisticas.total}</div>
                <div className="stat-label">Total Registros</div>
            </div>
            <div className="stat-card stat-card-inserts">
                <div className="stat-num stat-num-inserts">{estadisticas.inserts}</div>
                <div className="stat-label">Inserciones</div>
            </div>
            <div className="stat-card stat-card-updates">
                <div className="stat-num stat-num-updates">{estadisticas.updates}</div>
                <div className="stat-label">Actualizaciones</div>
            </div>
            <div className="stat-card stat-card-deletes">
                <div className="stat-num stat-num-deletes">{estadisticas.deletes}</div>
                <div className="stat-label">Eliminaciones</div>
            </div>
        </div>
    )
}