export default function EmptyState({ icon = "bi-inbox", title, description, action }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} />
      <h5 className="mb-1">{title}</h5>
      {description && <p className="mb-3">{description}</p>}
      {action}
    </div>
  );
}
